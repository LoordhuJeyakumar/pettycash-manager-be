const UserModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const sendVerificationEmail = require("../utils/sendVerificationEmail");
const jwt = require("jsonwebtoken");
const config = require("../utils/config");

const userController = {
  signup: async (request, response) => {
    try {
      const { name, email, phone, password, role } = request.body;
      let user = await UserModel.findOne({ email: email });


      if (user) {
        return response.status(409).send({
          message: `User with '${email}' already exists`,
        });
      }

      const passwordHash = bcrypt.hashSync(password, 10);

      const verificationToken = jwt.sign(
        {
          name,
          email,
          phone,
          role
        },
        config.JWT_SECRET
      );

      let newUser = new UserModel({
        name,
        email,
        phone,
        passwordHash,
        verificationToken,
        role,
      });

      let savedUser = await newUser.save();

      if (savedUser) {
        sendVerificationEmail(savedUser);

        return response.status(201).json({
          message:
            "User created successfully, Plaese check your email for verification",
        });
      }
    } catch (error) {
      return response.status(500).json({ error: error.message });
    }
  },

  verifyToken: async (request, response) => {
    const { verificationToken } = request.body;
    if (!verificationToken) {
      return response.status(400).json("Missing verification token");
    } else {
      try {
        const userByToken = await UserModel.findOne({
          verificationToken: verificationToken,
        });

        if (userByToken) {
          const decode = jwt.verify(verificationToken, config.JWT_SECRET);
          const user = await UserModel.findOne({ email: decode.email });

          if (!user) {
            return response
              .status(401)
              .send({ message: "Verification Token is not valid" });
          }

          if (user.verificationToken === verificationToken) {
            user.varification = true;
            user.verificationToken = "";

            let savedUser = await user.save();
            return response
              .status(200)
              .send({ message: "verificationToken is valid" });
          }
        } else {
          return response
            .status(401)
            .send({ message: "Verification Token is not valid" });
        }
      } catch (error) {
        if (error.name === "JsonWebTokenError") {
          return response
            .status(401)
            .send({ message: "Verification Token is not valid" });
        }

        if (error.name === "TokenExpiredError") {
          return response
            .status(401)
            .send({ message: "verificationToken Expired" });
        }

        return response.status(500).send({ error: error });
      }
    }
  },

  login: async (request, response) => {
    const { email, password } = request.body;

    const user = await UserModel.findOne({ email: email });

    try {
      if (!email && !password) {
        return response
          .status(400)
          .json({ message: "Missing username and password" });
      }

      if (!user) {
        return response
          .status(401)
          .json({ message: "user does not exist, Please Signup!" });
      }

      if (!user.varification) {
        return response
          .status(403)
          .json({ message: "Please verify your email" });
      }

      // if the user exists, compare the password with the passwordHash stored in the database
      const isAuthenticated = await bcrypt.compare(password, user.passwordHash);

      if (!isAuthenticated) {
        return response.status(401).json({ message: "invalid password" });
      }

      // if the password matches, generate a token
      const accessToken = jwt.sign(
        {
          name: user.name,
          email: user.email,
          id: user._id,
        },
        config.JWT_SECRET,
        { expiresIn: "8h" }
      );

      // send the token back to the user
      return response.status(200).json({
        id: user._id,
        name: user.name,
        email: user.email,
        accessToken,
      });
    } catch (error) {
      return response.status(500).send({ error: error.message });
    }
  },

  getAllManagers: async (request, response) => {
    try {
      const managers = await UserModel.find({ isManager: true });

      if (!managers) {
        return response.status(404).send({ message: "Mangers not found" });
      }

      return response
        .status(200)
        .send({ message: "Managers details", managers });
    } catch (error) {
      return response.status(500).send({ error: error.message });
    }
  },
};

module.exports = userController;
