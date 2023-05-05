import express from "express";
import cors from "cors";

import mongoose from "mongoose";
mongoose.set('strictQuery', true);

import { userRouter } from "./routes/user.js";
import { recipesRouter } from "./routes/recipes.js";




const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/v1/auth", userRouter);
app.use("/api/v1/recipes", recipesRouter);



/* --- DB Connection --- */
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true , useUnifiedTopology: true})
.then(() => {
    console.log("Connected to database")
    /* --- Server Starting --- */
    app.listen(3001, () => console.log("Server started"));
})
.catch((error) => console.error("Error connecting to database:",error));

