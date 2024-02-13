const mongoose = require("mongoose");

const balanceSchema = new mongoose.Schema({
  requestAmount: { type: Number },
  
  opeining_Balance: {
    type: Number,
    default: 0,
  },
  closing_Balance: {
    type: Number,
    default: 0,
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  approver: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
    unique: true,
  },
  isApproved: { type: Boolean, default: false },
  requestAt: { type: Date, default: Date.now() },
  approvedAt: { type: Date, default: null },
});

const BalanceModel = mongoose.model("Balance", balanceSchema, "balances");

module.exports = BalanceModel;
