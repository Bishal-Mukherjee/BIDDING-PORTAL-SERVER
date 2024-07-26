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
  attachment: {
    type: String,
    required: true,
  },
  currency: {
    type: String,
    required: true,
    default: "USD",
  },
  quality: {
    type: String,
    enum: ["good", "better", "best"],
    default: "good",
  },
  bidder: {
    type: {
      name: { type: String },
      email: { type: String },
      logo: { type: String },
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
