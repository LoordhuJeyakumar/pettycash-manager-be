const accountController = require("../controllers/accountController")
const { authMiddleware } = require("../middleware/authMiddleware")

const accountRouter = require("express").Router()

accountRouter.post("/create",authMiddleware.verifyAccessToken, accountController.createAccount)
accountRouter.get(
  "/",
  authMiddleware.verifyAccessToken,
  accountController.getAllAccounts
);
accountRouter.get(
  "/:id",
  authMiddleware.verifyAccessToken,
  accountController.getAccountById
);

accountRouter.put(
  "/update/:id",
  authMiddleware.verifyAccessToken,
  accountController.editAccount
);

accountRouter.delete(
  "/delete/:id",
  authMiddleware.verifyAccessToken,
  accountController.deleteAccount
);

module.exports = accountRouter