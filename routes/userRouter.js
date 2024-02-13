const userController = require("../controllers/userController");

const userRouter = require("express").Router();

userRouter.post("/signup", userController.signup);
userRouter.post("/verify", userController.verifyToken);
userRouter.post("/login", userController.login);
userRouter.get("/managers", userController.getAllManagers);

module.exports = userRouter;
