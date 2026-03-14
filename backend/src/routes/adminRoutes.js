const express = require('express');
const adminController = require('../controllers/adminController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const Joi = require('joi');

const router = express.Router();

router.use(protect);
router.use(restrictTo('ADMIN')); // Strict RBAC lock for this entire router

router.get('/users', adminController.getAllUsers);
router.get('/accounts', adminController.getAllAccounts);
router.get('/transactions', adminController.getAllTransactions);

const statusSchema = Joi.object({
  status: Joi.string().valid('ACTIVE', 'FROZEN', 'CLOSED', 'PENDING').required(),
  reason: Joi.string().optional()
});

router.patch('/accounts/:id/status', validateRequest(statusSchema), adminController.updateAccountStatus);
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;
