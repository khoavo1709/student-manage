import { Router } from "express";
import rateLimit from "express-rate-limit";
import { loginHandler } from "../controllers/authController";

const router = Router();

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, data: null, error: "Too many login attempts, please try again later" },
});

router.post("/login", loginRateLimiter, loginHandler);

export default router;
