const transactionService = require('../services/transactionService');
const logger = require('../utils/logger');

const processTransfer = async (req, res, next) => {
  try {
    const result = await transactionService.processTransfer(req.user.id, req.body);
    
    logger.info(`Transfer completed successfully: ${req.body.referenceId}`);

    res.status(200).json({
      status: 'success',
      message: 'Transfer completed successfully',
      data: result
    });
  } catch (err) {
    next(err);
  }
};

const getTransactionHistory = async (req, res, next) => {
  try {
    const { accountId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;

    const filters = {};
    if (req.query.startDate) filters.startDate = req.query.startDate;
    if (req.query.endDate) filters.endDate = req.query.endDate;
    if (req.query.type) filters.type = req.query.type;

    const { transactions, total } = await transactionService.getTransactionHistory(
      accountId, 
      req.user.id, 
      req.user.role, 
      page, 
      limit,
      filters
    );

    res.status(200).json({
      status: 'success',
      data: {
        transactions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

const getTransactionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const transaction = await transactionService.getTransactionById(id, req.user.id, req.user.role);

    res.status(200).json({
      status: 'success',
      data: {
        transaction
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  processTransfer,
  getTransactionHistory,
  getTransactionById
};
