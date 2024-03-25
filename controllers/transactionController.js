const AccountModel = require("../models/accountModel");
const TransactionModel = require("../models/transactionModel");
const multer = require("multer");
// configure multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

const transactionController = {
  create: async (request, response) => {
    try {
      const { files } = request;
      const userId = request.userId;
      const { pettyCashAccountId, description, amount, type } = request.body;

      const account = await AccountModel.findById(pettyCashAccountId);

      if (!account) {
        return response.status(404).send({ message: "Account not fount" });
      }

      const transaction = await TransactionModel.findOne({
        description: description,
        amount: amount,
        type: type,
      });

      if (transaction) {
        return response.status(409).send({
          message: "This transaction already exist",
          transactionDetails: transaction,
        });
      }

      const newTransaction = new TransactionModel(request.body);
      newTransaction.createdBy = userId;

      if (files.length) {
        for (let i = 0; i < files.length; i++) {
          newTransaction.receipts = newTransaction.receipts.concat({
            mimetype: files[i].mimetype,
            data: files[i].buffer,
          });
        }
      }

      let savedTransaction = await newTransaction.save();

      if (savedTransaction) {
        return response.status(201).send({
          message: "Transaction created succesfully",
          savedTransaction,
        });
      }
    } catch (error) {
      return response.status(500).send({ error: error.message });
    }
  },
  getCurrentMonthDetails: async (request, response) => {
    const { type } = request.params;
    try {
      if (!["expense", "income"].includes(type)) {
        return response
          .status(400)
          .send({ message: "Missing or invalid transaction type" });
      }
      let now = new Date();

      const year = now.getFullYear();
      const month = now.getMonth();

      // Create date objects for the start and end of the month
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 1);

      const transactionsDetails = await TransactionModel.find(
        {
          type: type,
          createdAt: { $gte: startDate, $lt: endDate },
        },
        { entries: 0, receipts: 0 }
      );
      const transactionsSummery = await TransactionModel.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startDate,
              $lt: endDate,
            },
            type: type,
          },
        },
        {
          $project: {
            entries: 0,
            receipts: 0,
          },
        },
        {
          $group: {
            _id: "$type",
            count: { $sum: 1 }, // count the documents
            totalAmount: { $sum: "$amount" }, // sum the amount field
          },
        },
      ]);

      if (!transactionsDetails) {
        return response
          .status(404)
          .send({ message: "There is no transaction" });
      }

      return response.status(200).json({
        message: `Current month ${type} details are fetched`,
        transactionsDetails,
        transactionsSummery,
      });
    } catch (error) {
      return response.status(500).send({ error: error.message });
    }
  },
  getPreviousMonthDetails: async (request, response) => {
    const { type } = request.params;
    try {
      if (!["expense", "income"].includes(type)) {
        return response
          .status(400)
          .send({ message: "Missing or invalid transaction type" });
      }
      let now = new Date();

      const year = now.getFullYear();
      const month = now.getMonth();

      // Create date objects for the start and end of the month
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);

      const transactionsDetails = await TransactionModel.find(
        {
          type: type,
          createdAt: { $gte: startDate, $lt: endDate },
        },
        { entries: 0, receipts: 0 }
      );
      const transactionsSummery = await TransactionModel.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startDate,
              $lt: endDate,
            },
            type: type,
          },
        },
        {
          $project: {
            entries: 0,
            receipts: 0,
          },
        },
        {
          $group: {
            _id: "$type",
            count: { $sum: 1 }, // count the documents
            totalAmount: { $sum: "$amount" }, // sum the amount field
          },
        },
      ]);

      if (!transactionsDetails) {
        return response
          .status(404)
          .send({ message: "There is no transaction" });
      }

      return response.status(200).json({
        message: `Previous month ${type} details are fetched`,
        transactionsDetails,
        transactionsSummery,
      });
    } catch (error) {
      return response.status(500).send({ error: error.message });
    }
  },
  getAllTransactions: async (request, response) => {
    try {
      const allTransactionsDetails = await TransactionModel.find(
        {},
        { entries: 0, receipts: 0 }
      );

      if (!allTransactionsDetails) {
        return response
          .status(404)
          .json({ message: "There is no transaction" });
      }

      const allTransactionsSummery = await TransactionModel.aggregate([
        {
          $group: {
            _id: null,
            totalTransactions: { $sum: 1 },
            totalAmount: { $sum: "$amount" },
          },
        },
      ]);
      return response.status(200).json({
        message: "Transaction details are fetched",
        allTransactionsDetails,
        allTransactionsSummery,
      });
    } catch (error) {
      return response.status(500).send({ error: error.message, error });
    }
  },
};

module.exports = transactionController;
