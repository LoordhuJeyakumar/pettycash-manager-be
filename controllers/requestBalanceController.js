const BalanceModel = require("../models/balanceModel");

const requestBalanceController = {
  requestBalance: async (req, res) => {
    try {
      const userId = req.userId;

      let { requestAmount, requestedBy, approver } = req.body;

      requestedBy = userId;

      const newBalance = new BalanceModel(req.body);

      await newBalance.save();
      return res.status(201).send({
        message: "New balance request created successfully",
        newBalance,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ error: error.message });
    }
  },
};

module.exports = requestBalanceController;
