// models/Client.js
const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: String,
    email: String,
    company: String,
    industry: String,
    phone: String,
    address: String,
    gstNumber: String,
    totalRevenue: {
      type: Number,
      default: 0,
    },
    totalInvoices: {
      type: Number,
      default: 0,
    },
    lastActivity: Date,
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Client", clientSchema);
