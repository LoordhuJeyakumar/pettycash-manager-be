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
    entries: [
      {
        entry_Name: {
          type: String,
          required: [true, "Entry description is required"],
        },
        entry_Amount: {
          type: Number,
          required: [true, "Transaction amount is required"],
          min: 0,
        },
        category: {
          // Optional for detailed categorization
          type: String,
          default: "",
        },
        receiptImage: {
          type: String,
          default: "",
        },
      },
    ],
    amount: {
      type: Number,
      /* required: [true, "Transaction amount is required"], */
      validate: {
        validator: (value) => value > 0,
        message: "Amount must be a positive number",
      },
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

    // Additional fields for receipts, invoices, etc. (optional)

    department: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

function checkIsValidEntries(entries) {
  let isValid = entries.find((entry) => {
    if (entry.entry_Name && entry.entry_Amount) {
      return true;
    } else {
      return null;
    }
  });

  return isValid;
}

async function transactionsMiddleware(next) {
  let transaction = this;
  const account = await AccountModel.findById(transaction.pettyCashAccountId);

  if (!account) {
    throw new Error("Invalid petty cash account ID");
  }

  if (!["expense", "income"].includes(transaction.type)) {
    throw new Error("Invalid transaction type");
  }

  let totalEntries = this.entries;

  if (checkIsValidEntries(this.entries)) {
    let sum = totalEntries.reduce(
      (accumulator, currentValue) => accumulator + currentValue.entry_Amount,
      0
    );
    this.amount = sum;
  } else {
    throw new Error("Invalid transaction entries");
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
