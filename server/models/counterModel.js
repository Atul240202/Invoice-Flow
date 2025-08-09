const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  prefix: {
    type: String,
    required: true
  },
  seq: {
    type: Number,
    default: 1
  }
});

counterSchema.index({ user: 1, prefix: 1 }, { unique: true });

const Counter = mongoose.model("Counter", counterSchema);
module.exports = Counter;
