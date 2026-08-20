import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import {
  createTuitionHandler,
  deleteTuitionHandler,
  getTuitionByIdHandler,
  listTuitionsHandler,
  updateTuitionHandler,
} from "../controllers/tuitionController";

const router = Router();

router.use(requireAuth);

router.get("/", listTuitionsHandler);
router.get("/:id", getTuitionByIdHandler);
router.post("/", createTuitionHandler);
router.put("/:id", updateTuitionHandler);
router.delete("/:id", deleteTuitionHandler);

export default router;
