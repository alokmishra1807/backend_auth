import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../db/schema";
 

export interface AuthRequest extends Request {
  user?: string; // MongoDB ObjectId is a string
  token?: string;
}

export const auth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("x-auth-token");

    if (!token) {
      return res.status(401).json({ error: "No auth token, access denied!" });
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET || "passwordKey");

    if (!verified || typeof verified !== "object") {
      return res.status(401).json({ error: "Token verification failed!" });
    }

    const { id } = verified as { id: string };

    const user = await User.findById(id);

    if (!user) {
      return res.status(401).json({ error: "User not found!" });
    }

    req.user = user._id.toString();
    req.token = token;

    next();
  } catch (e) {
    console.error("Auth error:", e);
    res.status(500).json({ error: "Server error in auth middleware" });
  }
};
