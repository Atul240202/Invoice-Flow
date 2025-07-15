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
    const topN = 5;

    const topClients = await Invoice.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: "$billToDetail",   
          revenue: { $sum: "$summary.totalAmount" }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: topN },
      {
        $lookup: {
          from: "clients",
          localField: "_id",
          foreignField: "_id",
          as: "client"
        }
      },
      { $unwind: "$client" },
      {
        $project: {
          _id: 0,
          name: "$client.name",
          value: { $round: ["$revenue", 2] }   
        }
      }
    ]);

     const topClientIds = topClients.map(c => c.name);

    const others = await Invoice.aggregate([
      { $match: { user: userId } },
      {
        $lookup: {
          from: "clients",
          localField: "billToDetail",
          foreignField: "_id",
          as: "client"
        }
      },
      { $unwind: "$client" },
      { $match: { "client.name": { $nin: topClientIds } } },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$summary.totalAmount" }
        }
      }
    ]);
    if (others.length && others[0].revenue > 0) {
      topClients.push({
        name: "Others",
        value: Math.round(others[0].revenue * 100) / 100
      });
    }

    res.json({ totalClients, distribution: topClients });
  } catch (err) {
    console.error("Client Summary Error:", err);
    res.status(500).json({ message: "Failed to fetch client summary" });
  }
});


router.get("/top", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 4;

    const topClients = await Invoice.aggregate([
      {
        $match: { user: userId }
      },
      {
        $group: {
          _id: "$billToDetail", // Group by client ID
          invoiceCount: { $sum: 1 },
          totalAmount: { $sum: "$summary.totalAmount" },
          lastInvoiceDate: { $max: "$date" }
        }
      },
      {
        $sort: { totalAmount: -1, lastInvoiceDate: -1 } // Primary: amount, Secondary: recency
      },
      { $limit: limit },
      {
        $lookup: {
          from: "clients",
          localField: "_id",
          foreignField: "_id",
          as: "client"
        }
      },
      { $unwind: "$client" },
      {
        $project: {
          name: "$client.name",
          status: "$client.status",
          invoices: "$invoiceCount",
          amount: {
            $concat: [
              "₹",
              { $toString: { $round: ["$totalAmount", 2] } }
            ]
          },
          lastInvoiceDate: 1
        }
      }
    ]);

    res.json(topClients);
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
