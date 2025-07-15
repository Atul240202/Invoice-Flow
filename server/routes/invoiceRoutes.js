const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const multer = require("multer");
const Invoice = require("../models/Invoice");

const {
    createInvoice,
    getUserInvoices,
    getSingleInvoice,
    updateInvoice,
    deleteInvoice,
   // generateInvoicePDF
} = require("../controllers/invoiceController");



const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `${Date.now()}--${file.originalname}`)
});

//router.get("/invoice/:id/generate-pdf", authMiddleware, generateInvoicePDF);




const upload = multer({storage});

router.post(
  '/',
  authMiddleware,
  upload.fields([
    { name: 'businessLogo', maxCount: 1 },
    { name: 'attachments', maxCount: 5 },
    { name: "qrImage", maxCount: 1 },
    { name: "signature", maxCount: 1 },
  ]),
  createInvoice
);

router.get('/', authMiddleware, getUserInvoices);

router.get('/summary', authMiddleware, async (req, res) => {
   try {
    const userId = req.user._id;

    const invoices = await Invoice.find({ user: userId });

    const totalRevenue = invoices.reduce(
      (sum, inv) => sum + (inv.amount ?? inv.summary?.totalAmount ?? 0),
      0
    );

    const totalInvoices = invoices.length;

    const clientNames = invoices.map(inv => inv.billTo?.businessName).filter(Boolean);
    const uniqueClients = new Set(clientNames);
    const totalClients = uniqueClients.size;

    res.status(200).json({
      totalRevenue,
      totalInvoices,
      totalClients,
    });

  } catch (error) {
    console.error("Error in summary:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

router.get('/recent', authMiddleware, async (req, res) => {
  console.log("inside /recent route, user:", req.user)

  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 4;

    const invoices = await Invoice.find({ user: userId })
      .sort({ invoiceDate: -1 })
      .limit(limit)
      .populate("billToDetail", "businessName name"); 

    console.log("Fetched Invoices:", invoices); 

    const formatted = invoices.map((inv) => {
      const clientName =
        inv.billToDetail?.businessName ||
        inv.billToDetail?.name ||
        inv.billTo?.businessName ||
        inv.billTo?.name ||
        "Unnamed";

      return {
        id: inv.invoiceNumber || inv._id,
        client: clientName,
        amount: `₹${(inv.summary?.totalAmount || inv.amount || 0).toLocaleString()}`,
        date: inv.invoiceDate ? inv.invoiceDate.toISOString().split("T")[0] : "",
        status: inv.status || "Unknown"
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error("Recent Invoices Error:", err);
    res.status(500).json({ message: "Failed to fetch recent invoices", error: err.message });
  }
});

router.get('/:id', authMiddleware, getSingleInvoice);
router.put(
  '/:id',
  authMiddleware,
  upload.fields([
    { name: 'businessLogo', maxCount: 1 },
    { name: 'attachments', maxCount: 5 },
    { name: "qrImage", maxCount: 1 },
    { name: "signature", maxCount: 1 },
  ]),
  updateInvoice
);

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

/*
router.get('/recent', authMiddleware, async (req, res) => {
  console.log("inside /recent route, user:", req.user)

  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 4;

    const invoices = await Invoice.find({ user: userId })
      .sort({ invoiceDate: -1 })
      .limit(limit)
      .populate("billToDetail", "businessName name"); 

    console.log("Fetched Invoices:", invoices); 

    const formatted = invoices.map((inv) => {
      const clientName =
        inv.billToDetail?.businessName ||
        inv.billToDetail?.name ||
        inv.billTo?.businessName ||
        inv.billTo?.name ||
        "Unnamed";

      return {
        id: inv.invoiceNumber || inv._id,
        client: clientName,
        amount: `₹${(inv.summary?.totalAmount || inv.amount || 0).toLocaleString()}`,
        date: inv.invoiceDate ? inv.invoiceDate.toISOString().split("T")[0] : "",
        status: inv.status || "Unknown"
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error("Recent Invoices Error:", err);
    res.status(500).json({ message: "Failed to fetch recent invoices", error: err.message });
  }
});
*/


module.exports = router;