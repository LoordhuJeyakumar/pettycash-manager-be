const UserModel = require("../models/userModel");
const jwt = require("jsonwebtoken");

const verifyToken = async (request, response) => {
  const { verificationToken } = request.body;
  if (!verificationToken) {
    response.status(400).json("Missing reset token");
  } else {
    try {
      const userByToken = await UserModel.findOne({
        verificationToken: verificationToken,
      });

      if (userByToken) {
        const decode = jwt.verify(verificationToken, config.JWT_SECRET);
        const user = await UserModel.findOne({ email: decode.email });

        if (user.verificationToken === verificationToken) {
          user.varification = true;
          user.verificationToken = "";

          await user.save();
          return response
            .status(200)
            .send({ message: "verificationToken is valid" });
        }
      } else {
        response.status(401).send("Verification Token is not valid");
      }
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return response.status(401).send("Verification Token is not valid");
      }

      if (error.name === "TokenExpiredError") {
        return response.status(401).send("verificationToken Expired");
      }

      return response.status(500).send({ error: error });
    }
  }
};

module.exports = verifyToken;
