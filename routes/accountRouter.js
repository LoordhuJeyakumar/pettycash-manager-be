const accountController = require("../controllers/accountController")
const { authMiddleware } = require("../middleware/authMiddleware")

const accountRouter = require("express").Router()

accountRouter.post("/create",authMiddleware.verifyAccessToken, accountController.createAccount)

module.exports = accountRouter