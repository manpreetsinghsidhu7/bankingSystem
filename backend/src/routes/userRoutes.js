const express = require('express');
const userController = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const Joi = require('joi');

const router = express.Router();

const updateProfileSchema = Joi.object({
  first_name: Joi.string().optional(),
  last_name: Joi.string().optional(),
  phone_number: Joi.string().allow('', null).optional()
});

router.use(protect); // All routes strictly protected

router.get('/profile', userController.getProfile);
router.patch('/profile', validateRequest(updateProfileSchema), userController.updateProfile);
router.delete('/profile', userController.deleteProfile);

module.exports = router;
