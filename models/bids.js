const mongoose = require("mongoose");

const bidSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  taskId: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    required: true,
    default: "USD",
  },
  bidder: {
    type: {
      name: { type: String },
      email: { type: String },
    },
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Bid = mongoose.model("bid", bidSchema);
