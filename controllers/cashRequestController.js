const AccountModel = require("../models/accountModel");
const Cash_Request_Model = require("../models/cashRequestModel");

const cashRequestController = {
  createRequest: async (request, response) => {
    try {
      const { accountId, purpose, amount } = request.body;

      const account = await AccountModel.findById(accountId);

      if (!account) {
        return response.status(404).send({ message: "Account not fount" });
      }

      const cash_request = await Cash_Request_Model.findOne({
        accountId: accountId,
        purpose: purpose,
        amount: amount,
        status: "Pending",
      });

      if (cash_request) {
        return response.status(409).send({
          message: "This request already exist, please get approvel",
          details: cash_request,
        });
      }

      const newRequest = new Cash_Request_Model(request.body);
      newRequest.requestedBy = request.userId;

      let savedRequest = await newRequest.save();

      if (savedRequest) {
        return response
          .status(201)
          .send({ message: "Cash request created succesfully", savedRequest });
      }
    } catch (error) {
      return response.status(500).send({ error: error.message });
    }
  },

  approveRequest: async (request, response) => {
    try {
      const userId = request.userId;
      const { cashRequestId } = request.body;

      const cashRequest = await Cash_Request_Model.findById(cashRequestId);

      if (!cashRequest) {
        return response.status(404).send({ message: "Request not fount" });
      }

      if (cashRequest.status === "Approved") {
        return response
          .status(409)
          .send({ message: "This request already approved" });
      }

      const updateRequest = await Cash_Request_Model.findOneAndUpdate(
        { _id: cashRequestId },
        { status: "Approved", approvedBy: userId, approvalDate: Date.now() }
      ).j(true);

      if (updateRequest) {
        return response
          .status(200)
          .send({ message: "Request approved successfully", updateRequest });
      }
    } catch (error) {
      return response.status(500).send({ error: error.message });
    }
  },
};

module.exports = cashRequestController;
