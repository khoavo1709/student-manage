import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../lib/env";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    return res.status(401).json({ success: false, data: null, error: "Missing auth token" });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret) as { adminId: number };
    req.adminId = payload.adminId;
    next();
  } catch (error) {
    console.log("requireAuth: invalid token", error);
    return res.status(401).json({ success: false, data: null, error: "Invalid or expired token" });
  }
}
