const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
    },
    date: {
      type: Date,
      required: true,
    },
    vendor: {
      type: String,
      required: true,
    },
    receipts: [
      {
        filename: String,
        mimetype: String,
        size: Number
      }
    ],
    description: String,
    amount: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    subCategory: String,
    gstPercent: {
      type: Number,
      default: 0,
    },
    itcEligible: {
      type: Boolean,
      default: false,
    },
    itcAmount: {
      type: Number,
      default: 0,
    },
    gstin: String,
    type: {
      type: String,
      enum: ["Personal", "Business"],
      default: "Personal",
    },
    tags: [String],
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringFrequency: {
      type: String,
      enum: ["Daily", "Weekly", "Monthly", "Quarterly", "Yearly"],
    },
    recurringStartDate: Date,
    recurringEndDate: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);