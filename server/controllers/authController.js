const User = require('../models/User');
const { generateToken, generateResetToken } = require('../utils/generateToken');
const verifyGoogleToken = require("../utils/googleVerify");
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');


exports.signup = async (req, res) => {
    const { fullName, email, password, businessName, phone } = req.body;

  try {
    const emailExists = await User.findOne({ email });
    if (emailExists) return res.status(409).json({ message: 'Email already registered' });

    const phoneExists = await User.findOne({ phone });
    if (phoneExists) return res.status(409).json({ message: 'Phone number already registered' });

    const user = await User.create({ fullName, email, password, businessName, phone });

    res.status(201).json({
      message: 'Signup successful',
      token: generateToken(user._id),
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        businessName: user.businessName,
        phone: user.phone,
        twoFAEnabled: user.twoFAEnabled,
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      message: 'Login successful',
      token: generateToken(user._id),
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        businessName: user.businessName,
        twoFAEnabled: user.twoFAEnabled,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.googleLogin = async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ message: 'Google credential missing' });
  }

  try {
    const googleUser = await verifyGoogleToken(credential);

    let user = await User.findOne({ email: googleUser.email });

    if (!user) {
      user = await User.create({
        fullName: googleUser.fullName,
        email: googleUser.email,
        password: 'google-auth', 
        businessName: '',
        phone: '0000000000', 
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      message: 'Google login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        businessName: user.businessName,
        phone: user.phone,
        twoFAEnabled: user.twoFAEnabled,
      }
    });

  } catch (error) {
    console.error('Google login error:', error.message);
    res.status(401).json({ message: 'Google login failed' });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const resetToken = generateResetToken(user._id);

  const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

  const success = await sendEmail(
    user.email,
    "Reset your password",
    `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`
  );

  if (!success) return res.status(500).json({ message: "Failed to send email" });

  res.status(200).json({ message: "Password reset email sent" });
};

exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.password = password;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Invalid or expired token" });
  }
};

exports.logout = async (req, res) => {
  try {
    // Option A: Simple client-side logout (recommended for JWT)
    res.status(200).json({ 
      message: 'Logout successful',
      instruction: 'Please remove token from client storage'
    });

    // Option B: If you want server-side token blacklisting
    // You would need to implement a token blacklist in your database
    // const token = req.header('Authorization')?.replace('Bearer ', '');
    // if (token) {
    //   await BlacklistedToken.create({ 
    //     token: token, 
    //     expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    //   });
    // }
    
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
};
