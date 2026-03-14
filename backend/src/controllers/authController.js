const authService = require('../services/authService');
const logger = require('../utils/logger');

const register = async (req, res, next) => {
  try {
    const { user, token } = await authService.register(req.body);
    
    logger.info(`User registered successfully: ${user.email || user.phone_number}`);
    
    res.status(201).json({
      status: 'success',
      data: {
        user,
        token
      }
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    
    const { user, token } = await authService.login(identifier, password);
    
    logger.info(`User logged in: ${user.email || user.phone_number}`);

    res.status(200).json({
      status: 'success',
      data: {
        user,
        token
      }
    });
  } catch (err) {
    next(err);
  }
};

const loginOtp = async (req, res, next) => {
  try {
    const { identifier } = req.body;
    
    const { user, token } = await authService.loginOtp(identifier);
    
    logger.info(`User logged in via OTP Bypass: ${user.email || user.phone_number}`);

    res.status(200).json({
      status: 'success',
      data: {
        user,
        token
      }
    });
  } catch (err) {
    next(err);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { identifier } = req.body;
    const response = await authService.forgotPassword(identifier);

    res.status(200).json({
      status: 'success',
      data: response
    });
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    const { user, token: jwtToken } = await authService.resetPassword(token, password);

    res.status(200).json({
      status: 'success',
      data: {
        user,
        token: jwtToken
      }
    });
  } catch (err) {
    next(err);
  }
};

const resetPasswordBypass = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    
    const { user, token: jwtToken } = await authService.resetPasswordBypass(identifier, password);

    res.status(200).json({
      status: 'success',
      data: {
        user,
        token: jwtToken
      }
    });
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    const response = await authService.changePassword(req.user.id, oldPassword, newPassword);

    res.status(200).json({
      status: 'success',
      data: response
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  loginOtp,
  forgotPassword,
  resetPassword,
  resetPasswordBypass,
  changePassword
};
