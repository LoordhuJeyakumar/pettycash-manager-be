const UserModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const sendVerificationEmail = require("../utils/sendVerificationEmail");
const jwt = require("jsonwebtoken");
const config = require("../utils/config");

const userController = {
  signup: async (request, response) => {
    try {
      const {
        name,
        email = request.body.email?.toLowerCase(),
        phone,
        password,
        role,
      } = request.body;
      let user = await UserModel.findOne({ email: email });

      if (user) {
        return response.status(409).json({
          message: `User with '${email}' already exists`,
        });
      }

      const passwordHash = bcrypt.hashSync(password, 10);

      const verificationToken = jwt.sign(
        {
          name,
          email,
          phone,
          role,
        },
        config.JWT_SECRET,
        { expiresIn: "48h" }
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
      return response
        .status(400)
        .json({ message: "Missing verification token" });
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
              .json({ message: "Verification Token is not valid" });
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
        console.log(error);
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
    const { email = request.body.email?.toLowerCase(), password } = request.body;

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
        return response.status(403).json({
          message: "Your account is InActive, Please verify your email",
        });
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
          role: user.role,
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
        role: user.role,
      });
    } catch (error) {
      return response.status(500).send({ error: error.message });
    }
  },

  getVerificationToken: async (request, response) => {
    const { email = request.body.email?.toLowerCase() } = request.body;

    try {
      if (!email) {
        return response.status(400).json({ message: "Missing email" });
      }

      const user = await UserModel.findOne({ email: email });

      if (!user) {
        return response
          .status(401)
          .json({ message: "user does not exist, Please Signup!" });
      }
      const token = jwt.sign(
        {
          name: user.name,
          email: user.email,
          id: user._id,
        },
        config.JWT_SECRET,
        { expiresIn: "48h" }
      );

      user.verificationToken = token;
      let savedUser = await user.save();
      if (savedUser) {
        sendVerificationEmail(savedUser);

        return response
          .status(200)
          .json({ message: "Verification email sent please check your email" });
      }
    } catch (error) {
      return response.status(500).json({ error: error.message });
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

  getUserDetails: async (request, response) => {
    const { id } = request.params;

    try {
      if (!id) {
        return response.status(400).json({ message: "Missing userId" });
      }

      const user = await UserModel.findById(id, {
        accessToken: 0,
        createdAT: 0,
        passwordHash: 0,
        updatedAt: 0,
        __v: 0,
      });

      if (!user) {
        return response
          .status(401)
          .json({ message: "user does not exist, Please check userId!" });
      }

      return response.status(200).send({ message: "User details", user });
    } catch (error) {
      return response.status(500).send({ error: error.message });
    }
  },

  updateUserDetails: async (request, response) => {
    const { id } = request.params;
    try {
      if (!id) {
        return response.status(400).json({ message: "Missing userId" });
      }
      const updatedUser = await UserModel.findByIdAndUpdate(id, request.body, {
        new: true,
      });
      if (updatedUser) {
        return response
          .status(200)
          .json({ message: "User updated successfully ", updatedUser });
      }
    } catch (error) {
      return response.status(500).send({ error: error.message });
    }
  },
  changePassword: async (request, response) => {
    const userID = request.params.id;
    const { currentPassword, newPassword, confirmNewPassword } = request.body;
    try {
      if (!userID) {
        return response.status(400).json({ message: "Missing userId" });
      }
      const user = await UserModel.findOne({ _id: userID });

      if (!currentPassword && !newPassword && !confirmNewPassword) {
        return response.status(400).json({
          message: "Missing current | new | confirm new password",
        });
      }

      if (!user) {
        return response
          .status(401)
          .json({ message: "user does not exist, Please check userId!" });
      }

      // if the user exists, compare the password with the passwordHash stored in the database
      const isValidPassword = await bcrypt.compare(
        currentPassword,
        user.passwordHash
      );

      if (!isValidPassword) {
        return response
          .status(401)
          .json({ message: "invalid current password" });
      }

      if (newPassword != confirmNewPassword) {
        return response.status(401).json({
          message: "New Password does not match with confirm password",
        });
      }

      const newPasswordHash = bcrypt.hashSync(newPassword, 10);

      user.passwordHash = newPasswordHash;

      let save = await user.save();
      if (save) {
        return response
          .status(200)
          .json({ message: "password successfully changed " });
      }
    } catch (error) {
      return response.status(500).send({ error: error.message });
    }
  },
  deactivate: async (request, response) => {
    const { id } = request.params;
    try {
      if (!id) {
        return response.status(400).json({ message: "Missing userId" });
      }
      const user = await UserModel.findOne({ _id: id });

      if (user) {
        user.varification = false;

        let savedUser = await user.save();
        if (savedUser) {
          return response
            .status(200)
            .json({ message: "User successfully de-activated " });
        } else {
          console.log("error");
        }
      } else {
        return response
          .status(401)
          .json({ message: "user does not exist, Please check userId!" });
      }
    } catch (error) {
      console.log(error);
      return response.status(500).json({ error: error.message });
    }
  },
  delete: async (request, response) => {
    const { id } = request.params;
    try {
      if (!id) {
        return response.status(400).json({ message: "Missing userId" });
      }
      const user = await UserModel.findOne({ _id: id });

      if (user) {
        let deletedUser = await UserModel.deleteOne({ _id: user._id });
        if (deletedUser) {
          return response
            .status(200)
            .json({ message: "User successfully deleted ", deletedUser });
        }
      } else {
        return response
          .status(401)
          .json({ message: "user does not exist, Please check userId!" });
      }
    } catch (error) {
      console.log(error);
      return response.status(500).json({ error: error.message });
    }
  },
};

module.exports = userController;
