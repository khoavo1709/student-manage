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
    // Chi sai tai khoan/mat khau moi la 401; loi khac (vd: mat ket noi DB) tra 500
    // voi thong bao chung de khong lo chi tiet noi bo ra client.
    if (error instanceof Error && error.message === "Invalid username or password") {
      return res.status(401).json({ success: false, data: null, error: error.message });
    }
    res.status(500).json({ success: false, data: null, error: "Login failed" });
  }
}
