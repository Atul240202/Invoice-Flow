const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
  getProfile,
  updateProfile,
  updateBusinessInfo,
  getBusinessInfo,
  updateSecuritySettings,
} = require('../controllers/settingsController');


router.get('/profile', authMiddleware, getProfile);

router.put('/profile', authMiddleware, updateProfile);

router.put('/business', authMiddleware, updateBusinessInfo);

router.get('/business', authMiddleware, getBusinessInfo);

router.put('/security', authMiddleware, updateSecuritySettings);

module.exports = router;