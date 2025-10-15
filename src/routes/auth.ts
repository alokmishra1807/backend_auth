import { Router, Request, Response } from "express";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../db/schema"; // ✅ If in same folder
 // adjust path if needed
import  {auth, AuthRequest } from "../middlewares/auth"; // assuming you have this

const authRouter = Router();

interface SignUpBody {
  name: string;
  email: string;
  password: string;
}

interface LoginBody {
  email: string;
  password: string;
}

const JWT_SECRET = process.env.JWT_SECRET || "passwordKey";

// Signup Route
authRouter.post(
  "/signup",
  async (req: Request<{}, {}, SignUpBody>, res: Response) => {
    try {
      const { name, email, password } = req.body;

      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res
          .status(400)
          .json({ error: "User with the same email already exists!" });
      }

      const hashedPassword = await bcryptjs.hash(password, 8);

      const user = new User({
        name,
        email,
        password: hashedPassword,
      });

      await user.save();

      res.status(201).json(user);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Login Route
authRouter.post(
  "/login",
  async (req: Request<{}, {}, LoginBody>, res: Response) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ error: "User with this email does not exist!" });
      }

      const isMatch = await bcryptjs.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ error: "Incorrect password!" });
      }

      const token = jwt.sign({ id: user._id }, JWT_SECRET);

      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Check if Token is Valid
authRouter.post("/tokenIsValid", async (req: Request, res: Response) => {
  try {
    const token = req.header("x-auth-token");

    if (!token) return res.json(false);

    const verified = jwt.verify(token, JWT_SECRET);

    if (!verified) return res.json(false);

    const user = await User.findById((verified as { id: string }).id);

    if (!user) return res.json(false);

    res.json(true);
  } catch (e) {
    console.error(e);
    res.status(500).json(false);
  }
});

// Get User Data (Protected Route)
authRouter.get("/", auth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found!" });
    }

    res.json({ ...user.toObject(), token: req.token });
  } catch (e) {
    console.error(e);
    res.status(500).json(false);
  }
});

export default authRouter;
