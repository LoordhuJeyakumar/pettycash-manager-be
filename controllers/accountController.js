const AccountModel = require("../models/accountModel");
const UserModel = require("../models/userModel");

const accountController = {
  createAccount: async (request, response) => {
    try {
      let { acc_Name, companyName, opening_Balance, createdBy } = request.body;
      const userId = request.userId;

      const user = await UserModel.findById(userId);

      const account = await AccountModel.findOne({
        acc_Name,
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

  editAccount: async (request, response) => {
    try {
      const userId = request.userId;
      const accountId = request.params.id
      const {  acc_Name, companyName } = request.body;
      const user = await UserModel.findById(userId)
      if (!userId) {
        return response.status(400).json({ message: "Missing userId" });
      }
      if (!user) {
        return response
          .status(401)
          .json({ message: "user does not exist, Please check userId!" });
      }
      if (user.role != "manager") {
        return response
          .status(403)
          .json({ message: "Sorry! You are not authorized" });
      }

      const editAccount = await AccountModel.findById(accountId)

      if(!editAccount){
        return response.status(401).json({message:"Account does not exist, Please check accountId"})
      }

      editAccount.acc_Name = acc_Name;
      editAccount.companyName = companyName;

      let updatedAccount = await editAccount.save()
      if(updatedAccount){
        return response
          .status(200)
          .json({ message: "Account updated successfully ", updatedAccount });
      
      }

    } catch (error) {
      return response.status(500).json({ error: error.message });
    }
  },
  getAllAccounts: async (request, response) => {
    const id = request.userId;
    try {
      if (!id) {
        return response.status(400).json({ message: "Missing userId" });
      }

      const user = await UserModel.findById(id);
      if (!user) {
        return response
          .status(401)
          .json({ message: "user does not exist, Please check userId!" });
      }

      /*  if (user.role != "manager") {
        return response
          .status(403)
          .json({ message: "Sorry! You are not authorized" });
      } */

      const accounts = await AccountModel.find();
      const accountsSummery = await AccountModel.aggregate([
        {
          $group: {
            _id: null,
            totalNoOfAccounts: { $sum: 1 },
            totalClossingBalance: { $sum: "$clossingBalance" },
          },
        },
      ]);

      if (accounts) {
        return response
          .status(200)
          .json({
            message: "Account details fetched",
            accounts,
            accountsSummery,
          });
      }
    } catch (error) {
      return response.status(500).json({ error: error.message });
    }
  },
  getAccountById:async (request, response)=>{
      const {id} = request.params
    try {
      if (!id){
        return response.status(400).json({ message: "Missing userId" });
      }
      const accountById = await AccountModel.findById(id)
      
      if(!accountById){
        return response
          .status(401)
          .json({ message: "Account does not exist, Please check accountId!" });
      }
      return response
      .status(200)
      .json({ message: "Account details fetched", accountById });

    } catch (error) {
      return response.status(500).json({ error: error.message });
    }
  },
  deleteAccount : async (request,response)=>{
    try {
      const {id} = request.params
      if(!id){
        return response.status(400).json({ message: "Missing accountId" });
      }
      
      const deletedAccount = await AccountModel.findByIdAndDelete(id)
      if(!deletedAccount){
        return response
        .status(401)
        .json({ message: "Account does not exist, Please check accountId!" });
      }

      return response
      .status(200)
      .json({ message: "Account deleted successfuly!", deletedAccount });
    } catch (error) {
      return response.status(500).json({ error: error.message });
    }
  }
};

module.exports = accountController;
