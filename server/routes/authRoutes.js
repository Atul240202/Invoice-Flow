const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const validateRequest = require('../middlewares/validateRequest');
const auth = require('../middlewares/authMiddleware'); // Your auth middleware

router.post(
  '/signup',
  [
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('phone').matches(/^[0-9]{10}$/).withMessage('Invalid phone number'),
  ],
  validateRequest,
  authController.signup
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validateRequest,
  authController.login
);

router.post('/google-login', authController.googleLogin);

router.post("/forgot-password", authController.forgotPassword);

router.post('/reset-password/:token', authController.resetPassword);

// NEW: Logout route (protected)
router.post('/logout', auth, authController.logout);

module.exports = router;