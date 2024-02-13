const balanceRouter = require("./balanceRouter");
const userRouter = require("./userRouter");

//import router
const appRouter = require("express").Router();

appRouter.get("/", (req, res) =>
  res.status(200).send(`
    <h1></h1>
    <h1>Welcome to Pettycash manager API</h1>
    <b style="color:white; background-color:green; padding:5">Connected to MongoDB Application Health is Good</b>`)
);

appRouter.use("/user", userRouter);
appRouter.use("/entry", balanceRouter);

module.exports = appRouter;
