const express = require('express');
const authController = require('../controllers/authController');
const validateRequest = require('../middlewares/validateRequest');
const Joi = require('joi');

const router = express.Router();

const registerSchema = Joi.object({
  identifier: Joi.string().required(),
  password: Joi.string().min(8).required(),
  first_name: Joi.string().required(),
  last_name: Joi.string().required()
});

const loginSchema = Joi.object({
  identifier: Joi.string().required(),
  password: Joi.string().required()
});

const { protect } = require('../middlewares/authMiddleware');

const forgotPasswordSchema = Joi.object({
  identifier: Joi.string().required()
});

const resetPasswordSchema = Joi.object({
  password: Joi.string().min(8).required()
});

const resetPasswordBypassSchema = Joi.object({
  identifier: Joi.string().required(),
  password: Joi.string().min(8).required()
});

const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required()
});

router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/login-otp', validateRequest(forgotPasswordSchema), authController.loginOtp);

router.post('/forgot-password', validateRequest(forgotPasswordSchema), authController.forgotPassword);
router.patch('/reset-password/:token', validateRequest(resetPasswordSchema), authController.resetPassword);
router.patch('/reset-password-bypass', validateRequest(resetPasswordBypassSchema), authController.resetPasswordBypass);

router.use(protect);
router.patch('/change-password', validateRequest(changePasswordSchema), authController.changePassword);

module.exports = router;
