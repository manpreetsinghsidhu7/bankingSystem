const express = require('express');
const accountController = require('../controllers/accountController');
const { protect } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const Joi = require('joi');

const router = express.Router();

router.use(protect); // All routes below require auth

const createAccountSchema = Joi.object({
  currency: Joi.string().valid('INR').default('INR'),
  dob: Joi.date().iso().required(),
  gender: Joi.string().valid('Male', 'Female', 'Other').required(),
  aadhaar_number: Joi.string().length(12).required(),
  pan_number: Joi.string().length(10).required()
});

const transactionSchema = Joi.object({
  amount: Joi.number().positive().required(),
  description: Joi.string().optional()
});

router.post('/', validateRequest(createAccountSchema), accountController.createAccount);
router.get('/', accountController.getMyAccounts);
router.get('/verify-receiver/:accountNumber', accountController.verifyReceiver);
router.get('/:id', accountController.getAccountDetails);
router.patch('/:id/pin', accountController.setPin);
router.post('/:id/verify-pin', accountController.verifyPin);

router.post('/:id/deposit', validateRequest(transactionSchema), accountController.deposit);
router.post('/:id/withdraw', validateRequest(transactionSchema), accountController.withdraw);
router.patch('/:id/close', accountController.closeAccount);
router.delete('/:id', accountController.deleteAccount);

module.exports = router;
