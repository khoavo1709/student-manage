import { Router } from "express";
import authRoutes from "./authRoutes";
import classRoutes from "./classRoutes";
import subjectRoutes from "./subjectRoutes";
import studentRoutes from "./studentRoutes";
import scoreRoutes from "./scoreRoutes";
import homeworkRoutes from "./homeworkRoutes";
import remarkRoutes from "./remarkRoutes";
import tuitionRoutes from "./tuitionRoutes";
import scheduleRoutes from "./scheduleRoutes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/classes", classRoutes);
router.use("/subjects", subjectRoutes);
router.use("/students", studentRoutes);
router.use("/scores", scoreRoutes);
router.use("/homeworks", homeworkRoutes);
router.use("/remarks", remarkRoutes);
router.use("/tuitions", tuitionRoutes);
router.use("/schedules", scheduleRoutes);

export default router;
