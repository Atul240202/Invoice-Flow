const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const Counter = require("../models/counterModel");

router.get("/generate-invoice-number", authMiddleware, async (req, res) => {
  try {
    const prefix = req.query.prefix || "INV";
    const userId = req.user._id;

    const counter = await Counter.findOneAndUpdate(
      { user: userId, prefix },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const invoiceNumber = `${prefix}${String(counter.seq).padStart(6, "0")}`;
    return res.status(200).json({ invoiceNumber });
  } catch (error) {
    console.error("Error generating invoice number:", error);
    res.status(500).json({ message: "Failed to generate invoice number", error: error.message });
  }
});

module.exports = router;
