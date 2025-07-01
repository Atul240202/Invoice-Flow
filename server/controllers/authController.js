const User = require('../models/User');
const generateToken = require('../utils/generateToken');

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
        twoFAEnabled: user.twoFAauth,
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
        twoFAEnabled: user.twoFAauth,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};