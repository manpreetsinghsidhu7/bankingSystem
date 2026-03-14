const userRepository = require('../repositories/userRepository');
const logger = require('../utils/logger');
const AppError = require('../utils/AppError');

const getProfile = async (req, res, next) => {
  try {
    const user = await userRepository.getUserById(req.user.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    // hide sensitive data
    const { password_hash, reset_password_token, reset_password_expires, ...safeUser } = user;
    
    res.status(200).json({
      status: 'success',
      data: { user: safeUser }
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    // Only allow specific fields to prevent mass assignment (e.g. changing role)
    const allowedUpdates = {};
    if (req.body.first_name) allowedUpdates.first_name = req.body.first_name;
    if (req.body.last_name) allowedUpdates.last_name = req.body.last_name;
    if (req.body.phone_number !== undefined) allowedUpdates.phone_number = req.body.phone_number;

    if (Object.keys(allowedUpdates).length === 0) {
      return next(new AppError('No valid fields to update', 400));
    }

    const updatedUser = await userRepository.updateUser(req.user.id, allowedUpdates);
    
    const { password_hash, reset_password_token, reset_password_expires, ...safeUser } = updatedUser;
    
    logger.info(`User ${safeUser.email} updated profile`);

    res.status(200).json({
      status: 'success',
      data: { user: safeUser }
    });
  } catch (error) {
    next(error);
  }
};

const deleteProfile = async (req, res, next) => {
  try {
    await userRepository.deleteUser(req.user.id);
    
    logger.info(`User deleted their own account: UserID ${req.user.id}`);
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  deleteProfile
};
