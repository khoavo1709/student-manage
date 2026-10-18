import { Router } from "express";
import authRoutes from "./authRoutes";
import classRoutes from "./classRoutes";
import studentRoutes from "./studentRoutes";
import scoreRoutes from "./scoreRoutes";
import tuitionRoutes from "./tuitionRoutes";
import scheduleRoutes from "./scheduleRoutes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/classes", classRoutes);
router.use("/students", studentRoutes);
router.use("/scores", scoreRoutes);
router.use("/tuitions", tuitionRoutes);
router.use("/schedules", scheduleRoutes);

export default router;
