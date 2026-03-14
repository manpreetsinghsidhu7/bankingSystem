const crypto = require('crypto');
const bcrypt = require('bcrypt');
const accountRepository = require('../repositories/accountRepository');
const userRepository = require('../repositories/userRepository');
const transactionRepository = require('../repositories/transactionRepository');
const AppError = require('../utils/AppError');

const accountService = {
  async createAccount(userId, data) {
    const user = await userRepository.getUserById(userId);
    
    // Portal user must have both email and phone to open an account
    if (!user.email || !user.phone_number) {
      throw new AppError('Please complete your portal profile (email & phone number required) before opening a bank account.', 400);
    }

    const currentAccounts = await accountRepository.getUserAccounts(userId);
    if (currentAccounts.length >= 3) {
      throw new AppError('Maximum limit of 3 accounts reached.', 400);
    }

    // Generate a unique 10-digit account number
    const account_number = `ACC-${crypto.randomInt(1000000000, 9999999999)}`;
    
    const accountData = {
      user_id: userId,
      account_number,
      currency: data.currency || 'INR',
      dob: data.dob,
      gender: data.gender,
      aadhaar_number: data.aadhaar_number,
      pan_number: data.pan_number,
      balance: 0.00,
      status: 'PENDING' // Needs admin approval
    };

    try {
      const account = await accountRepository.createAccount(accountData);
      return account;
    } catch (error) {
      console.error('Account creation error:', error);
      throw new AppError(error.message || 'Failed to create account', 500);
    }
  },

  async getAccountDetails(accountId, userId, role) {
    const account = await accountRepository.getAccountById(accountId);

    if (!account) {
      throw new AppError('Account not found', 404);
    }

    // Role-based authorization: User must own the account if not admin
    if (role !== 'ADMIN' && account.user_id !== userId) {
      throw new AppError('Not authorized to view this account', 403);
    }

    return account;
  },

  async getUserAccounts(userId) {
    return await accountRepository.getUserAccounts(userId);
  },

  async verifyReceiver(accountNumber) {
    const account = await accountRepository.getAccountByNumber(accountNumber);
    if (!account) throw new AppError('Receiver account not found', 404);
    if (account.status !== 'ACTIVE') throw new AppError('Receiver account is not active restricted', 400);
    return {
      account_number: account.account_number,
      name: `${account.users.first_name} ${account.users.last_name}`
    };
  },

  async setPin(accountId, userId, pin) {
    const account = await this.getAccountDetails(accountId, userId, 'USER');
    if (account.status !== 'ACTIVE' && account.status !== 'PENDING') throw new AppError('Account is not active', 400);

    const pinHash = await bcrypt.hash(pin.toString(), 10);
    await accountRepository.updateAccountPin(accountId, pinHash);
    return { message: 'PIN set successfully' };
  },

  async verifyPin(accountId, userId, pin) {
    const account = await this.getAccountDetails(accountId, userId, 'USER');
    if (!account.pin_hash) throw new AppError('PIN not set', 400);
    const isPinValid = await bcrypt.compare(pin.toString(), account.pin_hash);
    if (!isPinValid) throw new AppError('Invalid Payment PIN', 401);
    return { valid: true };
  },

  async deposit(accountId, userId, amount, description) {
    const account = await this.getAccountDetails(accountId, userId, 'USER');
    
    if (account.status !== 'ACTIVE') {
      throw new AppError('Account is not active. Deposit denied.', 403);
    }

    const referenceId = crypto.randomUUID();
    await transactionRepository.executeDeposit(accountId, amount, description || 'Account Deposit', referenceId);
    return { message: 'Deposit successful', referenceId };
  },

  async withdraw(accountId, userId, amount, description) {
    const account = await this.getAccountDetails(accountId, userId, 'USER');

    if (account.status !== 'ACTIVE') {
      throw new AppError('Account is not active. Withdrawal denied.', 403);
    }

    if (parseFloat(account.balance) < parseFloat(amount)) {
      throw new AppError('Insufficient funds for withdrawal', 400);
    }

    const referenceId = crypto.randomUUID();
    await transactionRepository.executeWithdrawal(accountId, amount, description || 'Account Withdrawal', referenceId);
    return { message: 'Withdrawal successful', referenceId };
  },

  async closeAccount(accountId, userId) {
    const account = await this.getAccountDetails(accountId, userId, 'USER');
    
    if (account.balance > 0) {
      throw new AppError('Cannot close account with a positive balance. Please withdraw funds first.', 400);
    }

    await accountRepository.updateAccountStatus(accountId, 'CLOSED');
    return { message: 'Account successfully closed' };
  },

  async deleteAccount(accountId, userId, pin) {
    const account = await this.getAccountDetails(accountId, userId, 'USER');

    // Verify PIN if set
    if (account.pin_hash) {
      const isPinValid = await bcrypt.compare(pin.toString(), account.pin_hash);
      if (!isPinValid) throw new AppError('Invalid PIN', 401);
    }

    if (parseFloat(account.balance) > 0) {
      throw new AppError('Cannot delete account with a positive balance. Please withdraw funds first.', 400);
    }

    await accountRepository.deleteAccount(accountId);
    return { message: 'Account permanently deleted' };
  }
};

module.exports = accountService;
