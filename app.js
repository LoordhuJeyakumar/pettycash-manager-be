//import express
const express = require("express");
//import cors
const cors = require("cors");
const appRouter = require("./routes");

//create a new express app (server)
const app = express();

//use the cors middleware
app.use(cors());

//use the express.json middleware
app.use(express.json());

app.use("/api/v1/", appRouter);

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

// export the app
module.exports = app;
