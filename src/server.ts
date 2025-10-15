import express from "express";
import authRouter from "./routes/auth"
import { connectDB } from "./utlis/dbs";import dotenv from "dotenv";
dotenv.config();


const app = express();


connectDB();

app.use(express.json());
app.use("/auth", authRouter);


app.get("/", (req, res) => {
  res.send("Welcome to my app!!!!!!!");
});

app.listen(8000, () => {
  console.log("Server started on port 8000");
});