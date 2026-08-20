import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import {
  createHomeworkHandler,
  deleteHomeworkHandler,
  getHomeworkByIdHandler,
  listHomeworksHandler,
  updateHomeworkHandler,
} from "../controllers/homeworkController";

const router = Router();

router.use(requireAuth);

router.get("/", listHomeworksHandler);
router.get("/:id", getHomeworkByIdHandler);
router.post("/", createHomeworkHandler);
router.put("/:id", updateHomeworkHandler);
router.delete("/:id", deleteHomeworkHandler);

export default router;
