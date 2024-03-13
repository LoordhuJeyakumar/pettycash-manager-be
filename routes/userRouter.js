const userController = require("../controllers/userController");
const { authMiddleware } = require("../middleware/authMiddleware");

const userRouter = require("express").Router();

userRouter.post("/signup", userController.signup);
userRouter.post("/verify", userController.verifyToken);
userRouter.post("/login", userController.login);
userRouter.get("/managers", userController.getAllManagers);
userRouter.post("/sendVerificationEmail", userController.getVerificationToken);
userRouter.get(
  "/:id",

  authMiddleware.verifyAccessToken,
  userController.getUserDetails
);
userRouter.put(
  "/update/:id",
  authMiddleware.verifyAccessToken,
  userController.updateUserDetails
);
userRouter.post(
  "/changePassword/:id",
  authMiddleware.verifyAccessToken,
  userController.changePassword
);
userRouter.post(
  "/deactivate/:id",
  authMiddleware.verifyAccessToken,
  userController.deactivate
);
userRouter.post(
  "/delete/:id",
  authMiddleware.verifyAccessToken,
  userController.delete
);

module.exports = userRouter;
