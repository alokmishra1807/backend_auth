import express from "express";
import authRouter from "./routes/auth"
import songRouter from "./routes/songs"
import { v2 as cloudinary } from 'cloudinary';
import { connectDB } from "./utlis/dbs";import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
const port = process.env.PORT || 8000;


const app = express();

// ✅ Allow all origins (for testing)
app.use(cors());

cloudinary.config({ 
  cloud_name: process.env.cloudinary_name, 
  api_key: process.env.cloud_Api_key, 
  api_secret: process.env.cloud_Api_Sec 
});


connectDB();

app.use(express.json());
app.use("/auth", authRouter);
app.use("/song", songRouter);


app.get("/", (req, res) => {
  res.send("Welcome to my app!!!!!!!");
});



app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
