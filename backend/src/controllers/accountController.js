const accountService = require('../services/accountService');
const logger = require('../utils/logger');

const createAccount = async (req, res, next) => {
  try {
    const account = await accountService.createAccount(req.user.id, req.body);

    logger.info(`Account created: ${account.account_number} for user: ${req.user.id}`);

    res.status(201).json({
      status: 'success',
      data: {
        account
      }
    });
  } catch (err) {
    next(err);
  }
};

const getAccountDetails = async (req, res, next) => {
  try {
    const accountId = req.params.id;
    const account = await accountService.getAccountDetails(accountId, req.user.id, req.user.role);

    res.status(200).json({
      status: 'success',
      data: {
        account
      }
    });
  } catch (err) {
    next(err);
  }
};

const getMyAccounts = async (req, res, next) => {
  try {
    const accounts = await accountService.getUserAccounts(req.user.id);

    res.status(200).json({
      status: 'success',
      data: {
        accounts
      }
    });
  } catch (err) {
    next(err);
  }
};

const deposit = async (req, res, next) => {
  try {
    const { amount, description } = req.body;
    const response = await accountService.deposit(req.params.id, req.user.id, amount, description);

    res.status(200).json({
      status: 'success',
      data: response
    });
  } catch (err) {
    next(err);
  }
};

const withdraw = async (req, res, next) => {
  try {
    const { amount, description } = req.body;
    const response = await accountService.withdraw(req.params.id, req.user.id, amount, description);

    res.status(200).json({
      status: 'success',
      data: response
    });
  } catch (err) {
    next(err);
  }
};

const closeAccount = async (req, res, next) => {
  try {
    const response = await accountService.closeAccount(req.params.id, req.user.id);

    res.status(200).json({
      status: 'success',
      data: response
    });
  } catch (err) {
    next(err);
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    const { pin } = req.body;
    const response = await accountService.deleteAccount(req.params.id, req.user.id, pin);
    res.status(200).json({ status: 'success', data: response });
  } catch (err) {
    next(err);
  }
};

const verifyReceiver = async (req, res, next) => {
  try {
    const receiver = await accountService.verifyReceiver(req.params.accountNumber);
    res.status(200).json({
      status: 'success',
      data: receiver
    });
  } catch (err) {
    next(err);
  }
};

const setPin = async (req, res, next) => {
  try {
    const { pin } = req.body;
    if (!pin || pin.toString().length !== 6) {
      return res.status(400).json({ status: 'fail', message: 'PIN must be 6 digits' });
    }
    const response = await accountService.setPin(req.params.id, req.user.id, pin);
    res.status(200).json({
      status: 'success',
      data: response
    });
  } catch (err) {
    next(err);
  }
};

const verifyPin = async (req, res, next) => {
  try {
    const { pin } = req.body;
    const response = await accountService.verifyPin(req.params.id, req.user.id, pin);
    res.status(200).json({
      status: 'success',
      data: response
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createAccount,
  getAccountDetails,
  getMyAccounts,
  deposit,
  withdraw,
  closeAccount,
  deleteAccount,
  verifyReceiver,
  setPin,
  verifyPin
};
