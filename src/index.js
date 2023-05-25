import express from "express";
import cors from "cors";
import bodyParser from 'body-parser';
import mongoose from "mongoose";
mongoose.set('strictQuery', true);

import { userRouter } from "./routes/user.js";
import { recipesRouter } from "./routes/recipes.js";
import { toursRouter } from "./routes/tours.js";

import schedule from 'node-schedule';
import guruwalk_schedulejob from './utils/guruwalk_scheduleJob.js'
import freetour_schedulejob from './utils/freetour_scheduleJob.js'
import eventbrite_schedulejob from "./utils/eventbrite_scheduleJob.js";

import dotenv from "dotenv"
dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use("/api/v1/auth", userRouter);
app.use("/api/v1/recipes", recipesRouter);
app.use("/api/v1/tours", toursRouter);

/* --- DB Connection --- */
async function startServer() {
  try {
    await mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected to database");

    /* --- Server Starting --- */
    app.listen(process.env.PORT || 4000, () => console.log("Server started"));
  } catch (error) {
    console.error("Error connecting to database:", error);
  }
}

await startServer();

/* --- Scheduele Job every hour --- */
var j = schedule.scheduleJob('48 * * * *', function () {
  console.log('... o\'clock and all\' well!');
  guruwalk_schedulejob().then(console.log('guruwalk DONE'));
  freetour_schedulejob().then(console.log('freetour DONE'));
  eventbrite_schedulejob().then(console.log('eventbrite DONE'));
});





