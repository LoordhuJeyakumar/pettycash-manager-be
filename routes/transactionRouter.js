const transactionController = require("../controllers/transactionController");
const { authMiddleware } = require("../middleware/authMiddleware");
const multer = require("multer");
const transactionRouter = require("express").Router();
// configure multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

transactionRouter.post(
  "/create",
  upload.array("receipts"),
  authMiddleware.verifyAccessToken,
  transactionController.create
);

transactionRouter.get(
  "/currentMonth/:type",
  authMiddleware.verifyAccessToken,
  transactionController.getCurrentMonthDetails
);
transactionRouter.get(
  "/previousMonth/:type",
  authMiddleware.verifyAccessToken,
  transactionController.getPreviousMonthDetails
);
transactionRouter.get(
  "/",
  authMiddleware.verifyAccessToken,
  transactionController.getAllTransactions
);

module.exports = transactionRouter;
