const AccountModel = require("../models/accountModel");
const UserModel = require("../models/userModel");

const accountController = {
  createAccount: async (request, response) => {
    try {
      let { acc_Name, companyName, opening_Balance, createdBy } = request.body;
      const userId = request.userId;

      const user = await UserModel.findById(userId);

      const account = await AccountModel.findOne({
        acc_name: request.body.acc_name,
      });

      if (account) {
        return response
          .status(409)
          .send({ message: `Account '${account.acc_Name}' already exists` });
      }

      createdBy = user._id;

      const newAccount = new AccountModel({
        acc_Name,
        companyName,
        opening_Balance,
        createdBy,
      });

      let savedAccount = await newAccount.save();

      if (savedAccount) {
        return response
          .status(201)
          .send({ message: "Account created succesfully", savedAccount });
      }
    } catch (error) {
      return response.status(500).json({ error: error.message });
    }
  },
};

module.exports = accountController;
