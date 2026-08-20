import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import {
  createClassHandler,
  deleteClassHandler,
  getClassByIdHandler,
  listClassesHandler,
  updateClassHandler,
} from "../controllers/classController";

const router = Router();

router.use(requireAuth);

router.get("/", listClassesHandler);
router.get("/:id", getClassByIdHandler);
router.post("/", createClassHandler);
router.put("/:id", updateClassHandler);
router.delete("/:id", deleteClassHandler);

export default router;
