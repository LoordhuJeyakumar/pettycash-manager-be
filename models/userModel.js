const mongoose = require("mongoose");

const validateEmail = (e) => {
  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  return emailPattern.test(e);
};

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Name is required"] },
  email: {
    type: String,
    required: [true, "Email is required"],
    validate: validateEmail,
  },
  phone: { type: String, default: null },
  addressDetails: {
    address: { type: String, default: null },
    city: { type: String, default: null },
    state: { type: String, default: null },
    pincode: { type: String, default: null },
  },
  role: {
    type: String,
    enum: ["manager", "user"],
    default: "user",
  },
  dob: { type: String, default: null },
  doj: { type: String, default: Date.now() },
  passwordHash: { type: String, required: [true, "Password is required"] },
  resetToken: { type: String, default: "" },
  verificationToken: { type: String, default: "" },
  varification: { type: Boolean, default: false },
  createdAT: { type: Date, default: Date.now() },
  updatedAt: { type: Date, default: Date.now() },
});

const UserModel = mongoose.model("User", userSchema, "users");

module.exports = UserModel;
