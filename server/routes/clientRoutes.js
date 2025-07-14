const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const Client = require("../models/Client");
const Invoice = require("../models/Invoice");

const {
  syncClientsFromInvoices,
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  toggleClientStatus,
} = require("../controllers/clientController");

router.use(authMiddleware);

// For syncing from invoices
router.post("/sync-from-invoices", syncClientsFromInvoices);

router.get("/", getClients);

router.get('/summary', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const totalClients = await Client.countDocuments({ user: userId });
    const invoices = await Invoice.find({user: userId}).populate("billTo")
    res.json({ totalClients });
  } catch (err) {
    console.error("Client Summary Error:", err);
    res.status(500).json({ message: "Failed to fetch client summary" });
  }
});


router.get("/top", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 4;

    const clients = await Client.aggregate([
      { $match: { user: userId } },
      {
        $lookup: {
          from: "invoices",
          localField: "_id",
          foreignField: "billTo",
          as: "invoices"
        }
      },
      {
        $addFields: {
          totalAmount: { $sum: "$invoices.summary.totalAmount" },
          invoiceCount: { $size: "$invoices" }
        }
      },
      { $sort: { totalAmount: -1 } },
      { $limit: limit }
    ]);

    const formatted = clients.map(c => ({
      name: c.name,
      amount: `₹${c.totalAmount?.toLocaleString() || 0}`,
      invoices: c.invoiceCount,
      status: c.status || "Active"
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Top Clients Error:", err);
    res.status(500).json({ message: "Failed to fetch top clients" });
  }
});



router.get("/:id", getClientById);
router.post("/", createClient);
router.put("/:id", updateClient);
router.delete("/:id", deleteClient);
router.patch("/:id/toggle", toggleClientStatus);


module.exports = router;
