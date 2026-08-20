import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import {
  createSubjectHandler,
  deleteSubjectHandler,
  getSubjectByIdHandler,
  listSubjectsHandler,
  updateSubjectHandler,
} from "../controllers/subjectController";

const router = Router();

router.use(requireAuth);

router.get("/", listSubjectsHandler);
router.get("/:id", getSubjectByIdHandler);
router.post("/", createSubjectHandler);
router.put("/:id", updateSubjectHandler);
router.delete("/:id", deleteSubjectHandler);

export default router;
