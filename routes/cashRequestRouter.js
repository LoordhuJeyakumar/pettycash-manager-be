const multer = require("multer");
const cashRequestController = require("../controllers/cashRequestController");
const { authMiddleware } = require("../middleware/authMiddleware");

const cashRequestRouter = require("express").Router();

// configure multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

cashRequestRouter.post(
  "/create",
  upload.array("documents"),
  authMiddleware.verifyAccessToken,

  cashRequestController.createRequest
);

cashRequestRouter.post(
  "/approve",
  authMiddleware.verifyAccessToken,
  cashRequestController.approveRequest
);

cashRequestRouter.post(
  "/reject",
  authMiddleware.verifyAccessToken,
  cashRequestController.rejectRequest
);

cashRequestRouter.get(
  "/pending",
  authMiddleware.verifyAccessToken,
  cashRequestController.getAllPendingRequests
);
cashRequestRouter.get(
  "/documents/:id",
  authMiddleware.verifyAccessToken,
  cashRequestController.getDocuments
);
cashRequestRouter.get("/download/:id", cashRequestController.donload);

cashRequestRouter.get(
  "/",
  authMiddleware.verifyAccessToken,
  cashRequestController.getAllCashRequests
);

module.exports = cashRequestRouter;
