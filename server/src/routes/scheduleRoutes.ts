import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import {
  createScheduleHandler,
  deleteScheduleHandler,
  getScheduleByIdHandler,
  listSchedulesHandler,
  updateScheduleHandler,
} from "../controllers/scheduleController";

const router = Router();

router.use(requireAuth);

router.get("/", listSchedulesHandler);
router.get("/:id", getScheduleByIdHandler);
router.post("/", createScheduleHandler);
router.put("/:id", updateScheduleHandler);
router.delete("/:id", deleteScheduleHandler);

export default router;
