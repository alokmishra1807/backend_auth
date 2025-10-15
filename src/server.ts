import express from "express";
import authRouter from "./routes/auth"
import { connectDB } from "./utlis/dbs";import dotenv from "dotenv";
dotenv.config();
const port = process.env.PORT || 8000;

const app = express();
const app = express();

// ✅ Allow all origins (for testing)
app.use(cors());


connectDB();

app.use(express.json());
app.use("/auth", authRouter);


app.get("/", (req, res) => {
  res.send("Welcome to my app!!!!!!!");
});



app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
