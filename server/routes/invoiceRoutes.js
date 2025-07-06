const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const multer = require("multer");
const {
    createInvoice,
    getUserInvoices,
    getSingleInvoice,
    updateInvoice,
    deleteInvoice
} = require("../controllers/invoiceController");

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `${Date.now()}--${file.originalname}`)
});

const upload = multer({storage});

router.post(
  '/',
  authMiddleware,
  upload.fields([
    { name: 'businessLogo', maxCount: 1 },
    { name: 'attachments', maxCount: 5 }
  ]),
  createInvoice
);

router.get('/', authMiddleware, getUserInvoices);
router.get('/:id', authMiddleware, getSingleInvoice);
router.put('/:id', authMiddleware, updateInvoice);
router.delete('/:id', authMiddleware, deleteInvoice);

router.put("/:id/bank-details", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      country,
      bankName,
      accountNumber,
      accountHolderName,
      accountType,
      currency,
      upiId
    } = req.body;

    const invoice = await Invoice.findOne({ _id: id, user: req.user.id });
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    invoice.bankDetails = {
      country,
      bankName,
      accountNumber,
      accountHolderName,
      accountType,
      currency,
    };

    invoice.upiDetails = { upiId };

    await invoice.save();

    res.status(200).json({ message: "Bank details added", invoice });
  } catch (error) {
    console.error("Error saving bank details:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;