const adminService = require('../services/adminService');
const logger = require('../utils/logger');

const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    
    const { data: users, total } = await adminService.getAllUsers(page, limit);

    res.status(200).json({
      status: 'success',
      data: {
        users,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      }
    });
  } catch (err) {
    next(err);
  }
};

const getAllAccounts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    
    const { accounts, total } = await adminService.getAllAccounts(page, limit);

    res.status(200).json({
      status: 'success',
      data: {
        accounts,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      }
    });
  } catch (err) {
    next(err);
  }
};

const getAllTransactions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;

    const { transactions, total } = await adminService.getAllTransactions(page, limit);

    res.status(200).json({
      status: 'success',
      data: {
        transactions,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      }
    });
  } catch (err) {
    next(err);
  }
};

const updateAccountStatus = async (req, res, next) => {
  try {
    const { id: accountId } = req.params;
    const { status } = req.body;

    const account = await adminService.updateAccountStatus(accountId, status, req.user.id);
    
    logger.info(`Admin ${req.user.id} updated account ${accountId} status to ${status}`);

    res.status(200).json({
      status: 'success',
      message: `Account status updated to ${status}`,
      data: account
    });
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id: userId } = req.params;
    
    await adminService.deleteUser(userId);
    
    logger.info(`Admin ${req.user.id} deleted user ${userId}`);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllUsers,
  getAllAccounts,
  getAllTransactions,
  updateAccountStatus,
  deleteUser
};
