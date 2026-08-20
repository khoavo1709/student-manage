import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { login } from "../services/authService";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function loginHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, password } = loginSchema.parse(req.body);
    const result = await login(username, password);
    res.json({ success: true, data: result, error: null });
  } catch (error) {
    console.log("loginHandler failed", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, data: null, error: "Invalid request body" });
    }
    res.status(401).json({ success: false, data: null, error: (error as Error).message });
  }
}
