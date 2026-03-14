const express = require('express');
const transactionController = require('../controllers/transactionController');
const { protect } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const Joi = require('joi');
const rateLimit = require('express-rate-limit');

const router = express.Router();

router.use(protect);

// Strict rate limiter for transfers to prevent brute force abuse and accidental double submitting
const transferLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // 5 transfers max per minute per IP
  message: 'Too many transfer attempts. Please try again later.'
});

const transferSchema = Joi.object({
  senderAccountId: Joi.string().guid({ version: 'uuidv4' }).required(),
  receiverAccountNumber: Joi.string().required(),
  amount: Joi.number().positive().precision(2).required(),
  description: Joi.string().max(255).allow('', null),
  referenceId: Joi.string().max(100) // Idempotency key
});

router.post('/transfer', transferLimiter, validateRequest(transferSchema), transactionController.processTransfer);

// :accountId is the account history to look up
router.get('/:accountId', transactionController.getTransactionHistory);

// Specific transaction details
router.get('/detail/:id', transactionController.getTransactionById);

module.exports = router;
