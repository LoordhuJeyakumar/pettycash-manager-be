const AccountModel = require("../models/accountModel");
const Cash_Request_Model = require("../models/cashRequestModel");
const UserModel = require("../models/userModel");
const archiver = require("archiver");

const cashRequestController = {
  createRequest: async (request, response) => {
    const { file, files } = request;
    try {
      const userId = request.userId;
      const { accountId, purpose, amount, documents } = request.body;

      const user = await UserModel.findById(userId);

      const account = await AccountModel.findById(accountId);

      if (!user) {
        return response
          .status(404)
          .send({ message: "User not found, Please check userId" });
      }

      if (!account) {
        return response
          .status(404)
          .send({ message: "Account not found, Please check accountId" });
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
      newRequest.accountName = account.acc_Name;
      newRequest.requestedUserName = user.name;
      console.log(file, files.length);
      if (files.length != 0) {
        for (let i = 0; i < files.length; i++) {
          newRequest.documents = newRequest.documents.concat({
            mimetype: files[i].mimetype,
            data: files[i].buffer,
          });
        }
      } else {
        newRequest.documents = [];
      }
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
      const user = await UserModel.findById(userId);
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
        {
          status: "Approved",
          approvedBy: userId,
          approvalDate: Date.now(),
          approvedUserName: user.name,
        }
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
  rejectRequest: async (request, response) => {
    try {
      const userId = request.userId;
      const { cashRequestId, rejectionReason } = request.body;

      const cashRequest = await Cash_Request_Model.findById(cashRequestId);
      if (!cashRequest) {
        return response.status(404).send({ message: "Request not found" });
      }

      if (cashRequest.status === "Approved") {
        return response
          .status(409)
          .send({ message: "This request already approved" });
      }
      if (cashRequest.status === "Rejected") {
        return response
          .status(409)
          .send({ message: "This request already rejected" });
      }

      cashRequest.rejectionReason = rejectionReason;
      cashRequest.status = "Rejected";

      const updateRequest = await cashRequest.save();

      if (updateRequest) {
        return response
          .status(200)
          .send({ message: "Request rejected successfully", updateRequest });
      }
    } catch (error) {
      return response.status(500).send({ error: error.message });
    }
  },
  getAllPendingRequests: async (request, response) => {
    try {
      const userId = request.userId;
      const user = await UserModel.findById(userId);
      /* if (user.role != "manager") {
        return response
          .status(403)
          .json({ message: "Sorry! You are not authorized" });
      } */

      const allPendingRequests = await Cash_Request_Model.find(
        {
          status: "Pending",
        },
        { documents: 0 }
      );

      const allPendingRequestsSummery = await Cash_Request_Model.aggregate([
        {
          $match: {
            status: "Pending",
          },
        },
        {
          $project: {
            documents: 0,
          },
        },
        {
          $group: {
            _id: null,
            totalPendingRequests: { $sum: 1 },
            totalAmount: { $sum: "$amount" },
          },
        },
      ]);

      if (allPendingRequests) {
        return response.status(200).json({
          message: "Requests details",
          allPendingRequests,
          allPendingRequestsSummery,
        });
      }
    } catch (error) {
      return response.status(500).send({ error: error.message });
    }
  },

  getAllCashRequests: async (request, response) => {
    try {
      const allCashRequests = await Cash_Request_Model.find(
        {},
        { documents: 0 }
      );
      if (allCashRequests) {
        return response
          .status(200)
          .json({ message: "Cash Request Details Fetched", allCashRequests });
      } else {
        throw Error;
      }
    } catch (error) {
      return response.status(500).send({ error: error.message, error });
    }
  },
  getDocuments: async (request, response) => {
    const { id } = request.params;
    try {
      if (!id) {
        return response.status(400).json({ message: "Missing id" });
      }

      const cashRequest = await Cash_Request_Model.findById(id, {
        documents: 1,
        accountId: 1,
        _id: 1,
      });

      if (!cashRequest) {
        return response.status(404).send({ message: "Request not found" });
      }

      const archive = archiver("zip");

      // Set the archive name
      response.attachment("Cash-Request-Documents.zip");

      // Use the archive object as a stream
      archive.pipe(response);

      const documents = cashRequest.documents;

      let fileSize = 0;
      documents.forEach((file) => {
        const fileData = Buffer.from(file.data.buffer);
        fileSize += fileData.length;
        archive.append(fileData, {
          name: `${file._id.toString()}.${file.mimetype.split("/")[1]}`,
        });
      });

      archive.on("progress ", function () {
        console.log("Archive wrote %d bytes", archive.totalBytes);
      });

      archive.finalize();

      // Listen for all archive data source 'end' events
      archive.on("end", function () {
        console.log("Archive wrote %d bytes", archive.pointer());
      });

      //  catch warnings (ie stat failures and other non-blocking errors)
      archive.on("warning", function (err) {
        if (err.code === "ENOENT") {
          console.warn("Archiver warning", err);
        } else {
          // throw error to handle it properly or it will bubble up to the `error` event
          throw err;
        }
      });

      //  catch this error explicitly
      archive.on("error", function (err) {
        console.error("Archiver error", err);
        response.status(500).send("Failed to create archive");
      });

      // All files have been appended, now we can finalize the archive
    } catch (error) {
      console.log(error);
      return response.status(500).send({ error: error.message, error });
    }
  },

  donload: async (request, response) => {
    const { id } = request.params;
    try {
      if (!id) {
        return response.status(400).json({ message: "Missing id" });
      }

      const cashRequest = await Cash_Request_Model.findById(id, {
        documents: 1,
        accountId: 1,
        _id: 1,
      });

      if (!cashRequest) {
        return response.status(404).send({ message: "Request not found" });
      }

      const archive = archiver("zip");
      // Set the archive name
      response.attachment("files.zip");

      // Use the archive object as a stream
      archive.pipe(response);
      const documents = cashRequest.documents;

      documents.forEach((file) => {
        const fileData = Buffer.from(file.data.buffer);
        archive.append(fileData, {
          name: `${file._id.toString()}.${file.mimetype.split("/")[1]}`,
        });
      });
      // Finalize the archive
      archive.finalize();

      // Listen for all archive data source 'end' events
      archive.on("end", function () {
        console.log("Archive wrote %d bytes", archive.pointer());
      });

      //  catch warnings (ie stat failures and other non-blocking errors)
      archive.on("warning", function (err) {
        if (err.code === "ENOENT") {
          console.warn("Archiver warning", err);
        } else {
          // throw error to handle it properly or it will bubble up to the `error` event
          throw err;
        }
      });

      //  catch this error explicitly
      archive.on("error", function (err) {
        console.error("Archiver error", err);
        response.status(500).send("Failed to create archive");
      });
    } catch (error) {
      console.log(error);
      return response.status(500).send({ error: error.message, error });
    }
  },
};

module.exports = cashRequestController;
