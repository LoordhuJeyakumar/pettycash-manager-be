const mongoose = require("mongoose");

const cash_RequestSchema = new mongoose.Schema({
  accountId:{type:mongoose.Schema.Types.ObjectId, ref:"Account"},
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model for cashier information
  },
  purpose: {
    type: String,
    required: true,
    trim: true, // Remove leading/trailing whitespace
  },
  amount: {
    type: Number,
    required: true,
    validate: {
      validator: (value) => value > 0,
      message: "Amount must be a positive number",
    },
  },
  dateRequested: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
  documents: {
    type: [String], // Array of document URLs or references
    default: [],
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the User model who approved
    default: null,
  },
  approvalDate: {
    type: Date,
    default: null,
  },
  rejectionReason: {
    type: String,
    default: null,
  },
});

const Cash_Request_Model = mongoose.model(
  "Cash_Request",
  cash_RequestSchema,
  cash_requests
);

module.exports = Cash_Request_Model;
