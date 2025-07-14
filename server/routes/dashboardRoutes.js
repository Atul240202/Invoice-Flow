const express = require("express");
const router = express.Router();
const Client = require("../models/Client");
const Invoice = require("../models/Invoice");
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware);

router.get("/stats", async (req, res) => {
  try {
    const userId = req.user._id;

    const invoices = await Invoice.find({ user: userId });

    const totalSales = invoices.reduce((sum, inv) => {
      return sum + (inv.summary?.totalAmount || inv.amount || 0);
    }, 0);

    const pendingInvoices = invoices.filter(inv => inv.status === "Pending");
    const pendingAmount = pendingInvoices.reduce((sum, inv) => {
      return sum + (inv.summary?.totalAmount || inv.amount || 0);
    }, 0);

    const totalClients = await Client.countDocuments({ user: userId });

    const stats = {
      totalSales: {
        title: "Total Sales",
        value: `₹${totalSales.toLocaleString()}`,
        subtitle: "This month",
        icon: "IndianRupee",
        trend: { value: "12.5%", isPositive: true }
      },
      pendingPayments: {
        title: "Pending Payments",
        value: `₹${pendingAmount.toLocaleString()}`,
        subtitle: `${pendingInvoices.length} invoices`,
        icon: "Clock",
        trend: { value: "5.2%", isPositive: false }
      },
      totalClients: {
        title: "Total Clients",
        value: `${totalClients}`,
        subtitle: "Active clients",
        icon: "Users",
        trend: { value: "8.1%", isPositive: true }
      },
      invoicesCreated: {
        title: "Invoices Created",
        value: `${invoices.length}`,
        subtitle: "This month",
        icon: "FileText",
        trend: { value: "15.3%", isPositive: true }
      }
    };

    res.json(stats);
  } catch (err) {
    console.error("Dashboard Stats Error:", err);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

module.exports = router;
