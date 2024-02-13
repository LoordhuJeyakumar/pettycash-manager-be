const mongoose =  require("mongoose")

const transectionSchema = new mongoose.Schema({
    pettyCashAccountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PettyCashManager',
        required: true,
      },
      date: {
        type: Date,
        required: true,
        default: Date.now,
      },
      description: {
        type: String,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
        min: 0,
      },
      type: {
        type: String,
        required: true,
        enum: ['expense', 'income'],
      },
      category: { // Optional for detailed categorization
        type: String,
      },
      // Additional fields for receipts, invoices, etc. (optional)
      receiptImage: {
        type: String,
      },
      invoiceNumber: {
        type: String,
      },
    }, { timestamps: true })