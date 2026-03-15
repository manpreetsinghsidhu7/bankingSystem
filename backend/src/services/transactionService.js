const transactionRepository = require('../repositories/transactionRepository');
const accountRepository = require('../repositories/accountRepository');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const AppError = require('../utils/AppError');

const transactionService = {
  async processTransfer(userId, { senderAccountId, receiverAccountNumber, amount, description, referenceId, pin }) {
    if (amount < 1) throw new AppError('Minimum transfer amount is ₹1', 400);
    if (!pin) throw new AppError('Payment PIN is required to authorise this transfer', 400);

    const senderAccount = await accountRepository.getAccountById(senderAccountId);
    if (!senderAccount) throw new AppError('Sender account not found', 404);

    // Verify ownership
    if (senderAccount.user_id !== userId) {
      throw new AppError('You do not own the sender account', 403);
    }
    
    // Validate status
    if (senderAccount.status !== 'ACTIVE') {
      throw new AppError('Your account is not yet active. Please wait for admin approval.', 403);
    }

    if (!senderAccount.pin_hash) {
      throw new AppError('Please set up a Payment PIN for this account before making transfers', 400);
    }
    const isPinValid = await bcrypt.compare(pin, senderAccount.pin_hash);
    if (!isPinValid) {
      throw new AppError('Incorrect Payment PIN. Please try again.', 401);
    }
    
    // To maintain idempotency, we require or generate a referenceId
    const finalReferenceId = referenceId || `TX-${crypto.randomUUID()}`;

    // Delegate to repository to hit the atomic `transfer_funds` postgres RPC function
    // The RPC will handle SELECT FOR UPDATE, deduce sender, increment receiver, log transaction
    const result = await transactionRepository.executeTransfer(
      senderAccountId, 
      receiverAccountNumber, 
      amount, 
      description,
      finalReferenceId
    );

    return result;
  },

  async getTransactionHistory(accountId, userId, role, page = 1, limit = 20, filters = {}) {
    const account = await accountRepository.getAccountById(accountId);
    if (!account) throw new AppError('Account not found', 404);

    if (role !== 'ADMIN' && account.user_id !== userId) {
      throw new AppError('Not authorized', 403);
    }

    const offset = (page - 1) * limit;
    return await transactionRepository.getAccountTransactions(accountId, limit, offset, filters);
  },

  async getTransactionById(transactionId, userId, role) {
    const transaction = await transactionRepository.getTransactionById(transactionId);
    
    if (!transaction) throw new AppError('Transaction not found', 404);

    if (role !== 'ADMIN') {
        const isSender = transaction.sender_account && transaction.sender_account.user_id === userId;
        const isReceiver = transaction.receiver_account && transaction.receiver_account.user_id === userId;
        
        if (!isSender && !isReceiver) {
            throw new AppError('Not authorized to view this transaction', 403);
        }
    }

    return transaction;
  }
};

module.exports = transactionService;
