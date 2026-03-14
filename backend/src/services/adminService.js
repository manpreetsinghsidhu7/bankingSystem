const userRepository = require('../repositories/userRepository');
const transactionRepository = require('../repositories/transactionRepository');
const accountRepository = require('../repositories/accountRepository');
const AppError = require('../utils/AppError');

const adminService = {
  async getAllUsers(page, limit) {
    return await userRepository.getAllUsers(page, limit);
  },

  async getAllAccounts(page, limit) {
    const offset = (page - 1) * limit;
    return await accountRepository.getAllAccounts(limit, offset);
  },

  async getAllTransactions(page, limit) {
    const offset = (page - 1) * limit;
    return await transactionRepository.getAllTransactions(limit, offset);
  },

  async updateAccountStatus(accountId, newStatus, adminId) {
    const validStatuses = ['ACTIVE', 'FROZEN', 'CLOSED', 'PENDING'];
    if (!validStatuses.includes(newStatus)) {
      throw new AppError('Invalid account status', 400);
    }
    
    const account = await accountRepository.updateAccountStatus(accountId, newStatus);
    
    // In a full implementation we'd also trigger an audit_logs insertion here
    // using the adminId tracking who froze the account.
    return account;
  },

  async deleteUser(userId) {
    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role === 'ADMIN') {
      throw new AppError('Cannot delete another admin', 403);
    }

    await userRepository.deleteUser(userId);
    return true;
  }
};

module.exports = adminService;
