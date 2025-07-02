const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('fullName email phone address businessName');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { phone, address, businessName } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { phone, address, businessName },
      { new: true }
    ).select('fullName email phone address businessName');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Profile update failed' });
  }
};

exports.updateBusinessInfo = async (req, res) => {
  try {
    const { businessName, gstin, pan, businessType, address } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        businessName,
        gstin,
        pan,
        businessType,
        businessAddress: address,
      },
      { new: true }
    ).select("businessName gstin pan businessType address");

    res.status(200).json({ message: "Business info updated", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Failed to update business info" });
  }
};

exports.updateSecuritySettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword, twoFactorEnabled } = req.body;

    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedNewPassword;
    }

    if (typeof twoFactorEnabled === "boolean") {
      user.twoFAEnabled = twoFactorEnabled;
    }

    await user.save();

    res.json({ message: "Security settings updated successfully" });
  } catch (err) {
    console.error("Security update error:", err);
    res.status(500).json({ message: "Failed to update security settings" });
  }
};
