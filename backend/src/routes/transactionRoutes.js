const express = require('express');
const transactionController = require('../controllers/transactionController');
const { protect } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const Joi = require('joi');
const rateLimit = require('express-rate-limit');

const router = express.Router();

router.use(protect);

const transferLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 5, 
  message: 'Too many transfer attempts. Please try again later.'
});

const transferSchema = Joi.object({
  senderAccountId: Joi.string().guid({ version: 'uuidv4' }).required(),
  receiverAccountNumber: Joi.string().required(),
  amount: Joi.number().positive().min(1).precision(2).required(),
  description: Joi.string().max(255).allow('', null),
  referenceId: Joi.string().max(100), 
  pin: Joi.string().length(6).pattern(/^[0-9]+$/).required()
});

router.post('/transfer', transferLimiter, validateRequest(transferSchema), transactionController.processTransfer);

router.get('/:accountId', transactionController.getTransactionHistory);

router.get('/detail/:id', transactionController.getTransactionById);

module.exports = router;
