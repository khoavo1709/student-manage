import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import {
  createStudentHandler,
  deleteStudentHandler,
  getStudentByIdHandler,
  listStudentsHandler,
  updateStudentHandler,
} from "../controllers/studentController";

const router = Router();

router.use(requireAuth);

router.get("/", listStudentsHandler);
router.get("/:id", getStudentByIdHandler);
router.post("/", createStudentHandler);
router.put("/:id", updateStudentHandler);
router.delete("/:id", deleteStudentHandler);

export default router;
