//import mongoose
const mongoose = require("mongoose");
const config = require("./utils/config");

//import app
const app = require("./app");

console.log("Connecting to database.....");

//connect to mongodb

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    console.log("Connected to the MongoDB...");

    //start the server
    app.listen(config.PORT, () => {
      console.log(`Server running on port ${config.PORT}`);
    });
  })
  .catch((error) => {
    console.log("Error connecting to the MongoDB", error);
  });
