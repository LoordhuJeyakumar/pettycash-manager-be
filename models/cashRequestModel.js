const mongoose = require("mongoose");
const AccountModel = require("./accountModel");

const cash_RequestSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true,
  },
  accountName: {
    type: String,
    ref: "Account",
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model for cashier information
  },
  requestedUserName: {
    type: String,
    ref: "User", // Reference to the User model for cashier information
  },
  approvedUserName: {
    type: String,
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
  documents: [
    {
      mimetype: { type: String, default: null },
      data: { type: Buffer, default: null },
    },
  ],
  documentsCount: { type: Number, default: 0 },
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

async function cashRequestMiddleware() {
  const cashRequestObj = await this.model.findOne(this.getQuery());
  const account = await AccountModel.findById(cashRequestObj.accountId);

  if (!account) {
    throw new Error("Invalid petty cash account ID");
  }

  let newOpeningBalance;

  if (this._update.status === "Approved") {
    newOpeningBalance = account.clossingBalance + cashRequestObj.amount;
  }

  let obj = {
    opening_Balance: newOpeningBalance,
    cashRequests: account.cashRequests.concat(cashRequestObj._id),
  };

  account.opening_Balance = newOpeningBalance;
  account.cashRequests = account.cashRequests.concat(cashRequestObj._id);
  await account.save();

  /* let savedAccount = await AccountModel.findOneAndUpdate(
    { _id: cashRequestObj.accountId },
    obj
  ); */
}

cash_RequestSchema.pre(["findOneAndUpdate"], cashRequestMiddleware);
cash_RequestSchema.pre("save", function (next) {
  this.documentsCount = this.documents.length;
  next();
});

const Cash_Request_Model = mongoose.model(
  "Cash_request",
  cash_RequestSchema,
  "cash_requests"
);



module.exports = Cash_Request_Model;
