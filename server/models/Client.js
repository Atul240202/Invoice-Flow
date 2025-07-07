const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  name: { type: String, required: true },
  email: { type: String },
  company: { type: String },
  industry: { type: String },
  phone: { type: String },
  gstin: { type: String },
  address: { type: String },
  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active"
  },
  lastActivity: { type: Date, default: Date.now },
  totalRevenue: { type: Number, default: 0 },
  invoiceCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Client", clientSchema);
