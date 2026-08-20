import { Request, Response } from "express";
import { z } from "zod";
import {
  createHomework,
  deleteHomework,
  getHomeworkById,
  listHomeworks,
  updateHomework,
} from "../services/homeworkService";

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const listQuerySchema = z.object({
  studentId: z.coerce.number().int().positive().optional(),
  subjectId: z.coerce.number().int().positive().optional(),
  status: z.string().min(1).optional(),
});

const homeworkBodySchema = z.object({
  studentId: z.number().int().positive(),
  subjectId: z.number().int().positive(),
  title: z.string().min(1),
  status: z.string().min(1),
  dueDate: z.coerce.date(),
});

const homeworkUpdateSchema = homeworkBodySchema.partial();

export async function listHomeworksHandler(req: Request, res: Response) {
  try {
    const query = listQuerySchema.parse(req.query);
    const homeworks = await listHomeworks(query);
    res.json({ success: true, data: homeworks, error: null });
  } catch (error) {
    console.log("listHomeworksHandler failed", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, data: null, error: "Invalid query params" });
    }
    res.status(500).json({ success: false, data: null, error: "Failed to list homeworks" });
  }
}

export async function getHomeworkByIdHandler(req: Request, res: Response) {
  try {
    const { id } = idParamSchema.parse(req.params);
    const homework = await getHomeworkById(id);
    res.json({ success: true, data: homework, error: null });
  } catch (error) {
    console.log("getHomeworkByIdHandler failed", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, data: null, error: "Invalid request" });
    }
    if (error instanceof Error && error.message === "Homework not found") {
      return res.status(404).json({ success: false, data: null, error: error.message });
    }
    res.status(500).json({ success: false, data: null, error: "Failed to get homework" });
  }
}

export async function createHomeworkHandler(req: Request, res: Response) {
  try {
    const body = homeworkBodySchema.parse(req.body);
    const homework = await createHomework(body);
    res.status(201).json({ success: true, data: homework, error: null });
  } catch (error) {
    console.log("createHomeworkHandler failed", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, data: null, error: "Invalid request body" });
    }
    res.status(500).json({ success: false, data: null, error: "Failed to create homework" });
  }
}

export async function updateHomeworkHandler(req: Request, res: Response) {
  try {
    const { id } = idParamSchema.parse(req.params);
    const body = homeworkUpdateSchema.parse(req.body);
    const homework = await updateHomework(id, body);
    res.json({ success: true, data: homework, error: null });
  } catch (error) {
    console.log("updateHomeworkHandler failed", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, data: null, error: "Invalid request" });
    }
    if (error instanceof Error && error.message === "Homework not found") {
      return res.status(404).json({ success: false, data: null, error: error.message });
    }
    res.status(500).json({ success: false, data: null, error: "Failed to update homework" });
  }
}

export async function deleteHomeworkHandler(req: Request, res: Response) {
  try {
    const { id } = idParamSchema.parse(req.params);
    await deleteHomework(id);
    res.json({ success: true, data: null, error: null });
  } catch (error) {
    console.log("deleteHomeworkHandler failed", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, data: null, error: "Invalid request" });
    }
    if (error instanceof Error && error.message === "Homework not found") {
      return res.status(404).json({ success: false, data: null, error: error.message });
    }
    res.status(500).json({ success: false, data: null, error: "Failed to delete homework" });
  }
}
