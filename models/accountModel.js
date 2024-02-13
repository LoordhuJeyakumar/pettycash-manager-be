const mongoose = require("mongoose");

const accountModel = new mongoose.Schema(
  {
    acc_Name: { type: String, required: [true, "Account Name is required"] },
    companyName: { type: String },
    opening_Balance: {
      type: Number,
      min: 0,
      required: [true, "Opening balance is required"],
    },
    createdAT: { type: Date, default: Date.now() },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
      unique: true,
    },
    clossingBalance: {
      type: Number,
      min: 0,
      required: [true, "Closing balance is required"],
    },
    cashRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    transactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
      },
    ],
  },
  { timestamps: true }
);
