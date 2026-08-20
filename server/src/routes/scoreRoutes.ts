import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import {
  createScoreHandler,
  deleteScoreHandler,
  getScoreByIdHandler,
  listScoresHandler,
  updateScoreHandler,
} from "../controllers/scoreController";

const router = Router();

router.use(requireAuth);

router.get("/", listScoresHandler);
router.get("/:id", getScoreByIdHandler);
router.post("/", createScoreHandler);
router.put("/:id", updateScoreHandler);
router.delete("/:id", deleteScoreHandler);

export default router;
