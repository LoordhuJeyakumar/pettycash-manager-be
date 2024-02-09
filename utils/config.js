//import dotenv
const dotEnv = require("dotenv");

//config dot env
dotEnv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT;
const DB_NAME = process.env.DB_NAME;
const EMAIL_HOST = process.env.EMAIL_HOST;
const EMAIL_PORT = process.env.EMAIL_PORT;
const EMAIL_SECURE = process.env.EMAIL_SECURE;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const FRONTEND_BASEURI = process.env.FRONTEND_BASEURI;
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = {
  MONGODB_URI,
  PORT,
  DB_NAME,
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS,
  JWT_SECRET,
  EMAIL_SECURE,
  FRONTEND_BASEURI,
};
