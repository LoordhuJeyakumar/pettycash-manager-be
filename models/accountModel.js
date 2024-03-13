const mongoose = require("mongoose");

const accountModelSchema = new mongoose.Schema(
  {
    acc_Name: {
      type: String,
      required: [true, "Account Name is required"],
      unique: true,
    },
    companyName: { type: String, default: "" },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    opening_Balance: {
      type: Number,
      min: 0,
      required: [true, "Opening balance is required"],
    },

    clossingBalance: {
      type: Number,
      min: 0,
      required: [true, "Closing balance is required"],
      default: 0,
    },
    cashRequests: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Cash_Request" },
    ],
    transactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
      },
    ],
  },
  { timestamps: true }
);

accountModelSchema.pre(["findOneAndUpdate", "save"], async function (next) {
  if (this.opening_Balance < 0) {
    throw new Error("Opening balance must be non-negative");
  }
  if (this._update) {
  }
  this.clossingBalance = this.opening_Balance || this._update.opening_Balance;
  next();
});

const AccountModel = mongoose.model("Account", accountModelSchema, "accounts");

module.exports = AccountModel;
