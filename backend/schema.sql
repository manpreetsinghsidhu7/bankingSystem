-- ==========================================
-- VAYU BANK: Unified Database Schema
-- ==========================================
-- This file contains the complete structure for tables,
-- relationships, and stored procedures (RPCs).

-- 0. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table (Core Portal Identity)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'USER', -- 'USER' or 'ADMIN'
    phone_number VARCHAR(20) UNIQUE,
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Search Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);


-- 2. Accounts Table (Banking Products)
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    account_number VARCHAR(20) UNIQUE NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    balance DECIMAL(15, 2) DEFAULT 0.00 CHECK (balance >= 0),
    status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'ACTIVE', 'FROZEN', 'CLOSED'
    
    -- KYC / Personal Info
    dob DATE,
    gender VARCHAR(10),
    aadhaar_number VARCHAR(12),
    pan_number VARCHAR(10),
    
    -- Security
    pin_hash VARCHAR(255), -- Hashed 6-digit payment PIN
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Search Indexes
CREATE INDEX IF NOT EXISTS idx_accounts_number ON accounts(account_number);
CREATE INDEX IF NOT EXISTS idx_accounts_user ON accounts(user_id);


-- 3. Transactions Table (Financial Ledger)
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    receiver_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    amount DECIMAL(15, 2) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL, -- 'TRANSFER', 'DEPOSIT', 'WITHDRAWAL'
    status VARCHAR(20) DEFAULT 'COMPLETED',
    description TEXT,
    reference_id UUID UNIQUE, -- Prevent duplicate transaction processing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Search Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_sender ON transactions(sender_account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_receiver ON transactions(receiver_account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at);


-- 4. Audit Logs (Administrative Tracking)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- 'LOGIN', 'FREEZE_ACCOUNT', 'APPROVE_REQUEST', etc.
    details JSONB, -- For logging old/new balance values or metadata
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- 5. RPC Functions (Atomic Balance Updates)
-- These functions ensure balance and logs are updated in a single transaction.

-- RPC: Deposit Funds
CREATE OR REPLACE FUNCTION deposit_funds(
  target_account_id UUID,
  deposit_amount DECIMAL(15,2),
  deposit_desc TEXT,
  ref_id UUID
) RETURNS void AS $$
BEGIN
  -- 1. Log transaction (fails if ref_id already exists)
  INSERT INTO transactions (id, transaction_type, receiver_account_id, amount, description, status)
  VALUES (ref_id, 'DEPOSIT', target_account_id, deposit_amount, deposit_desc, 'COMPLETED');

  -- 2. Increment balance
  UPDATE accounts 
  SET balance = balance + deposit_amount,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = target_account_id AND status = 'ACTIVE';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Deposit failed: Account not found or not active';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- RPC: Withdraw Funds
CREATE OR REPLACE FUNCTION withdraw_funds(
  source_account_id UUID,
  withdraw_amount DECIMAL(15,2),
  withdraw_desc TEXT,
  ref_id UUID
) RETURNS void AS $$
BEGIN
  -- 1. Check constraints (Sufficient balance & Active status)
  IF (SELECT status FROM accounts WHERE id = source_account_id) != 'ACTIVE' THEN
    RAISE EXCEPTION 'Account is not active';
  END IF;

  IF (SELECT balance FROM accounts WHERE id = source_account_id FOR UPDATE) < withdraw_amount THEN
    RAISE EXCEPTION 'Insufficient funds';
  END IF;

  -- 2. Log transaction
  INSERT INTO transactions (id, transaction_type, sender_account_id, amount, description, status)
  VALUES (ref_id, 'WITHDRAWAL', source_account_id, withdraw_amount, withdraw_desc, 'COMPLETED');

  -- 3. Decrement balance
  UPDATE accounts 
  SET balance = balance - withdraw_amount,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = source_account_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- RPC: Transfer Funds (P2P)
CREATE OR REPLACE FUNCTION transfer_funds(
    sender_id UUID, 
    receiver_acc_num VARCHAR, 
    transfer_amount DECIMAL, 
    transfer_desc TEXT, 
    ref_id UUID
) RETURNS void AS $$
DECLARE
    receiver_row RECORD;
BEGIN
    -- 1. Find receiver
    SELECT * INTO receiver_row FROM accounts WHERE account_number = receiver_acc_num;
    IF receiver_row IS NULL THEN
        RAISE EXCEPTION 'Receiver account not found';
    END IF;

    -- 2. Verify status and balances
    IF (SELECT status FROM accounts WHERE id = sender_id) != 'ACTIVE' OR receiver_row.status != 'ACTIVE' THEN
        RAISE EXCEPTION 'One or both accounts are not active';
    END IF;
    
    IF (SELECT balance FROM accounts WHERE id = sender_id FOR UPDATE) < transfer_amount THEN
        RAISE EXCEPTION 'Insufficient funds';
    END IF;

    -- 3. Atomic exchange
    UPDATE accounts SET balance = balance - transfer_amount, updated_at = CURRENT_TIMESTAMP WHERE id = sender_id;
    UPDATE accounts SET balance = balance + transfer_amount, updated_at = CURRENT_TIMESTAMP WHERE id = receiver_row.id;

    -- 4. Create single ledger entry
    INSERT INTO transactions (id, sender_account_id, receiver_account_id, amount, transaction_type, description, status)
    VALUES (ref_id, sender_id, receiver_row.id, transfer_amount, 'TRANSFER', transfer_desc, 'COMPLETED');

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
