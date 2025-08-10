const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
  getProfile,
  updateProfile,
  updateBusinessInfo,
  getBusinessInfo,
  updateSecuritySettings,
  getBillFrom,
  saveBillFrom,
  getShippedFrom,
  saveShippedFrom,
  getGstConfig,
  saveGstConfig,
  getBankDetails,
  saveBankDetails,
} = require('../controllers/settingsController');


router.get('/profile', authMiddleware, getProfile);

router.put('/profile', authMiddleware, updateProfile);

router.put('/business', authMiddleware, updateBusinessInfo);

router.get('/business', authMiddleware, getBusinessInfo);

router.put('/security', authMiddleware, updateSecuritySettings);

router.get('/bill-from', authMiddleware, getBillFrom);
router.post('/bill-from', authMiddleware, saveBillFrom);

router.get('/shipped-from', authMiddleware, getShippedFrom);
router.post('/shipped-from', authMiddleware, saveShippedFrom);  

router.get('/gst-config', authMiddleware, getGstConfig);
router.post('/gst-config', authMiddleware, saveGstConfig);

router.get('/bank-details', authMiddleware, getBankDetails);
router.post('/bank-details', authMiddleware, saveBankDetails);

module.exports = router;