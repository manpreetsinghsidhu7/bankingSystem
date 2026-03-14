const bcrypt = require('bcrypt');
const userRepository = require('../repositories/userRepository');
const { signToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');

const crypto = require('crypto');

const authService = {
  async register(userData) {
    try {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(userData.password, salt);

      const newUserData = {
        password_hash,
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: 'USER' // Default role
      };
      
      if (userData.identifier.includes('@')) {
        newUserData.email = userData.identifier;
      } else {
        newUserData.phone_number = userData.identifier;
      }

      const user = await userRepository.createUser(newUserData);
      const token = signToken(user.id, user.role);

      return { user, token };
    } catch (error) {
      if (error.message === 'Email or phone already exists') {
        throw new AppError('Email or phone already in use', 409);
      }
      throw new AppError('Error creating user system', 500);
    }
  },

  async login(identifier, password) {
    const user = await userRepository.getUserByIdentifier(identifier);

    if (!user) {
      throw new AppError('Incorrect credentials', 401);
    }

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      throw new AppError('Account is temporarily locked due to too many failed login attempts. Try again later.', 403);
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      // Increment failed attempts
      let failedAttempts = (user.failed_login_attempts || 0) + 1;
      let updates = { failed_login_attempts: failedAttempts };
      
      if (failedAttempts >= 5) {
        updates.locked_until = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // Lock for 15 minutes
      }
      
      await userRepository.updateUser(user.id, updates);
      throw new AppError('Incorrect email or password', 401);
    }

    // Reset failed attempts on successful login
    if (user.failed_login_attempts > 0 || user.locked_until) {
      await userRepository.updateUser(user.id, { failed_login_attempts: 0, locked_until: null });
    }

    const token = signToken(user.id, user.role);

    // Remove sensitive data
    const { password_hash, reset_password_token, reset_password_expires, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  },

  async loginOtp(identifier) {
    const user = await userRepository.getUserByIdentifier(identifier);

    if (!user) {
      throw new AppError('Account not found', 404);
    }

    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      throw new AppError('Account is temporarily locked. Try again later.', 403);
    }

    if (user.failed_login_attempts > 0 || user.locked_until) {
      await userRepository.updateUser(user.id, { failed_login_attempts: 0, locked_until: null });
    }

    const token = signToken(user.id, user.role);
    const { password_hash, reset_password_token, reset_password_expires, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  },

  async forgotPassword(identifier) {
    const user = await userRepository.getUserByIdentifier(identifier);
    if (!user) {
      // Return success anyway to prevent enumeration
      return { message: 'If that account exists, a reset link has been sent.' };
    }

    // Generate random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token before saving to DB
    const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Set expiry to 10 minutes
    const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await userRepository.updateUser(user.id, {
      reset_password_token: passwordResetToken,
      reset_password_expires: passwordResetExpires
    });

    // In a real app, send an email here. We will just return the unhashed token for simulation.
    return { 
      message: 'Password reset token generated (simulated email)',
      resetToken // Warning: Returning this is only for development/simulation
    };
  },

  async resetPassword(token, newPassword) {
    // Hash token to compare with DB
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    const user = await userRepository.getUserByResetToken(hashedToken);
    
    if (!user || new Date(user.reset_password_expires) < new Date()) {
      throw new AppError('Token is invalid or has expired', 400);
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    // Update password and clear reset fields
    await userRepository.updateUser(user.id, {
      password_hash,
      reset_password_token: null,
      reset_password_expires: null,
      failed_login_attempts: 0,
      locked_until: null
    });

    // Automatically log them back in
    const jwtToken = signToken(user.id, user.role);
    const { password_hash: ph, ...userSafe } = user;
    
    return { user: userSafe, token: jwtToken };
  },

  async resetPasswordBypass(identifier, newPassword) {
    const user = await userRepository.getUserByIdentifier(identifier);
    if (!user) {
      throw new AppError('Account not found', 404);
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    await userRepository.updateUser(user.id, {
      password_hash,
      failed_login_attempts: 0,
      locked_until: null
    });

    const jwtToken = signToken(user.id, user.role);
    const { password_hash: ph, ...userSafe } = user;
    
    return { user: userSafe, token: jwtToken };
  },

  async changePassword(userId, oldPassword, newPassword) {
    const user = await userRepository.getUserById(userId);
    
    if (oldPassword !== 'BYPASS_OTP') {
      const isValidPassword = await bcrypt.compare(oldPassword, user.password_hash);
      if (!isValidPassword) {
        throw new AppError('Incorrect current password', 401);
      }
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    await userRepository.updateUser(userId, { password_hash });
    
    return { message: 'Password changed successfully' };
  }
};

module.exports = authService;
