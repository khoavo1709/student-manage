import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import {
  createRemarkHandler,
  deleteRemarkHandler,
  getRemarkByIdHandler,
  listRemarksHandler,
  updateRemarkHandler,
} from "../controllers/remarkController";

const router = Router();

router.use(requireAuth);

router.get("/", listRemarksHandler);
router.get("/:id", getRemarkByIdHandler);
router.post("/", createRemarkHandler);
router.put("/:id", updateRemarkHandler);
router.delete("/:id", deleteRemarkHandler);

export default router;
