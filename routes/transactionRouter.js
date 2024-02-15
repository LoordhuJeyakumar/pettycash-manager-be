const transactionController = require("../controllers/transactionController");
const { authMiddleware } = require("../middleware/authMiddleware");

const transactionRouter = require("express").Router();

transactionRouter.post(
  "/create",
  authMiddleware.verifyAccessToken,
  transactionController.create
);

module.exports = transactionRouter;
