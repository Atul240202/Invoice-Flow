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

exports.getBusinessInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      'businessName gstin pan businessType businessAddress'
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch business info" });
  }
};

exports.updateSecuritySettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword, twoFAEnabled } = req.body;

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

    if (typeof twoFAEnabled === "boolean") {
      user.twoFAEnabled = twoFAEnabled;
    }

    await user.save();

    res.json({ message: "Security settings updated successfully" });
  } catch (err) {
    console.error("Security update error:", err);
    res.status(500).json({ message: "Failed to update security settings" });
  }
};

exports.getBillFrom = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('defaultBillFrom');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ billFrom: user.defaultBillFrom || {} });
  } catch (error) {
    console.error("Error fetching billFrom:", error);
    res.status(500).json({ message: "Failed to fetch Bill From info" });
  }
};

exports.saveBillFrom = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.defaultBillFrom = req.body;

    await user.save();

    res.status(200).json({ message: "Bill From info saved", billFrom: user.defaultBillFrom });
  } catch (error) {
    console.error("Error saving billFrom:", error);
    res.status(500).json({ message: "Failed to save Bill From info" });
  }
};

exports.getShippedFrom = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('defaultShippingFrom');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ shippedFrom: user.defaultShippingFrom || {} });
  } catch (error) {
    console.error("Error fetching shippedFrom:", error);
    res.status(500).json({ message: "Failed to fetch shippedFrom info" });
  }
};

exports.saveShippedFrom = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.defaultShippingFrom = req.body;

    await user.save();

    res.status(200).json({ message: "Shipped From info saved", shippedFrom: user.defaultShippingFrom });
  } catch (error) {
    console.error("Error saving shippedFrom:", error);
    res.status(500).json({ message: "Failed to save Shipped From info" });
  }
};


exports.getGstConfig = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('gstConfig');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ gstConfig: user.gstConfig || {} });
  } catch (err) {
    console.error("Error fetching GST config:", err);
    res.status(500).json({ message: "Failed to fetch GST config" });
  }
};

exports.saveGstConfig = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.gstConfig = req.body;
    await user.save();

    res.status(200).json({ message: "GST config saved", gstConfig: user.gstConfig });
  } catch (err) {
    console.error("Error saving GST config:", err);
    res.status(500).json({ message: "Failed to save GST config" });
  }
};

