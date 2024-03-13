const cashRequestController = require("../controllers/cashRequestController");
const { authMiddleware } = require("../middleware/authMiddleware");

const cashRequestRouter = require("express").Router();

cashRequestRouter.post(
  "/create",
  authMiddleware.verifyAccessToken,
  cashRequestController.createRequest
);

cashRequestRouter.post(
  "/approve",
  authMiddleware.verifyAccessToken,
  cashRequestController.approveRequest
);

module.exports = cashRequestRouter;
