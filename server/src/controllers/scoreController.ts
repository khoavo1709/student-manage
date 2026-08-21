import { Request, Response } from "express";
import { z } from "zod";
import {
  createScore,
  deleteScore,
  getScoreById,
  listScores,
  updateScore,
} from "../services/scoreService";

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const listQuerySchema = z.object({
  studentId: z.coerce.number().int().positive().optional(),
  classId: z.coerce.number().int().positive().optional(),
});

const scoreBodySchema = z.object({
  studentId: z.number().int().positive(),
  classId: z.number().int().positive(),
  examName: z.string().min(1),
  value: z.number(),
  date: z.coerce.date(),
  note: z.string().optional().nullable(),
});

const scoreUpdateSchema = scoreBodySchema.partial();

export async function listScoresHandler(req: Request, res: Response) {
  try {
    const query = listQuerySchema.parse(req.query);
    const scores = await listScores(query);
    res.json({ success: true, data: scores, error: null });
  } catch (error) {
    console.log("listScoresHandler failed", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, data: null, error: "Invalid query params" });
    }
    res.status(500).json({ success: false, data: null, error: "Failed to list scores" });
  }
}

export async function getScoreByIdHandler(req: Request, res: Response) {
  try {
    const { id } = idParamSchema.parse(req.params);
    const score = await getScoreById(id);
    res.json({ success: true, data: score, error: null });
  } catch (error) {
    console.log("getScoreByIdHandler failed", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, data: null, error: "Invalid request" });
    }
    if (error instanceof Error && error.message === "Score not found") {
      return res.status(404).json({ success: false, data: null, error: error.message });
    }
    res.status(500).json({ success: false, data: null, error: "Failed to get score" });
  }
}

export async function createScoreHandler(req: Request, res: Response) {
  try {
    const body = scoreBodySchema.parse(req.body);
    const score = await createScore(body);
    res.status(201).json({ success: true, data: score, error: null });
  } catch (error) {
    console.log("createScoreHandler failed", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, data: null, error: "Invalid request body" });
    }
    res.status(500).json({ success: false, data: null, error: "Failed to create score" });
  }
}

export async function updateScoreHandler(req: Request, res: Response) {
  try {
    const { id } = idParamSchema.parse(req.params);
    const body = scoreUpdateSchema.parse(req.body);
    const score = await updateScore(id, body);
    res.json({ success: true, data: score, error: null });
  } catch (error) {
    console.log("updateScoreHandler failed", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, data: null, error: "Invalid request" });
    }
    if (error instanceof Error && error.message === "Score not found") {
      return res.status(404).json({ success: false, data: null, error: error.message });
    }
    res.status(500).json({ success: false, data: null, error: "Failed to update score" });
  }
}

export async function deleteScoreHandler(req: Request, res: Response) {
  try {
    const { id } = idParamSchema.parse(req.params);
    await deleteScore(id);
    res.json({ success: true, data: null, error: null });
  } catch (error) {
    console.log("deleteScoreHandler failed", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, data: null, error: "Invalid request" });
    }
    if (error instanceof Error && error.message === "Score not found") {
      return res.status(404).json({ success: false, data: null, error: error.message });
    }
    res.status(500).json({ success: false, data: null, error: "Failed to delete score" });
  }
}
