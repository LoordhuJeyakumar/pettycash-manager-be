const mongoose = require("mongoose");
const AccountModel = require("./accountModel");

const transactionSchema = new mongoose.Schema(
  {
    pettyCashAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PettyCashManager",
      required: [true, "Account Id is requierd"],
    },
    description: {
      type: String,
      required: [true, "Transaction description is required"],
    },
    amount: {
      type: Number,
      required: [true, "Transaction amount is required"],
      min: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      required: [true, "type is requierd"],
      enum: ["expense", "income"],
    },
    category: {
      // Optional for detailed categorization
      type: String,
      default: "",
    },
    // Additional fields for receipts, invoices, etc. (optional)
    receiptImage: {
      type: String,
      default: "",
    },
    department: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

async function transactionsMiddleware(next) {
  
  let transaction = this;
  const account = await AccountModel.findById(transaction.pettyCashAccountId);

  if (!account) {
    throw new Error("Invalid petty cash account ID");
  }

  if (!["expense", "income"].includes(transaction.type)) {
    throw new Error("Invalid transaction type");
  }

  let updatedBalance;
  if (transaction.type === "expense") {
    updatedBalance = account.clossingBalance - transaction.amount;
  } else {
    updatedBalance = account.clossingBalance + transaction.amount;
  }

  if (updatedBalance < 0) {
    throw new Error(
      "Insufficient funds to make an transaction, Please request fund from your manager"
    );
  }

  await AccountModel.findByIdAndUpdate(transaction.pettyCashAccountId, {
    clossingBalance: updatedBalance,
    transactions: account.transactions.concat(transaction._id),
  });
  next();
}

transactionSchema.pre(["findOneAndUpdate", "save"], transactionsMiddleware);

const TransactionModel = mongoose.model(
  "Transaction",
  transactionSchema,
  "transactions"
);

module.exports = TransactionModel;
