const AccountModel = require("../models/accountModel");
const TransactionModel = require("../models/transactionModel");

const transactionController = {
  create: async (request, response) => {
    try {
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

      let savedTransaction = await newTransaction.save();

      if (savedTransaction) {
        return response
          .status(201)
          .send({ message: "Transaction created succesfully" });
      }
    } catch (error) {
      return response.status(500).send({ error: error.message });
    }
  },
};

module.exports = transactionController;
