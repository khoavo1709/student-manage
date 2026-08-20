import { Request, Response } from "express";
import { z } from "zod";
import {
  createSubject,
  deleteSubject,
  getSubjectById,
  listSubjects,
  updateSubject,
} from "../services/subjectService";

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const subjectBodySchema = z.object({
  name: z.string().min(1),
});

export async function listSubjectsHandler(req: Request, res: Response) {
  try {
    const subjects = await listSubjects();
    res.json({ success: true, data: subjects, error: null });
  } catch (error) {
    console.log("listSubjectsHandler failed", error);
    res.status(500).json({ success: false, data: null, error: "Failed to list subjects" });
  }
}

export async function getSubjectByIdHandler(req: Request, res: Response) {
  try {
    const { id } = idParamSchema.parse(req.params);
    const subject = await getSubjectById(id);
    res.json({ success: true, data: subject, error: null });
  } catch (error) {
    console.log("getSubjectByIdHandler failed", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, data: null, error: "Invalid request" });
    }
    if (error instanceof Error && error.message === "Subject not found") {
      return res.status(404).json({ success: false, data: null, error: error.message });
    }
    res.status(500).json({ success: false, data: null, error: "Failed to get subject" });
  }
}

export async function createSubjectHandler(req: Request, res: Response) {
  try {
    const { name } = subjectBodySchema.parse(req.body);
    const subject = await createSubject(name);
    res.status(201).json({ success: true, data: subject, error: null });
  } catch (error) {
    console.log("createSubjectHandler failed", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, data: null, error: "Invalid request body" });
    }
    res.status(500).json({ success: false, data: null, error: "Failed to create subject" });
  }
}

export async function updateSubjectHandler(req: Request, res: Response) {
  try {
    const { id } = idParamSchema.parse(req.params);
    const { name } = subjectBodySchema.parse(req.body);
    const subject = await updateSubject(id, name);
    res.json({ success: true, data: subject, error: null });
  } catch (error) {
    console.log("updateSubjectHandler failed", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, data: null, error: "Invalid request" });
    }
    if (error instanceof Error && error.message === "Subject not found") {
      return res.status(404).json({ success: false, data: null, error: error.message });
    }
    res.status(500).json({ success: false, data: null, error: "Failed to update subject" });
  }
}

export async function deleteSubjectHandler(req: Request, res: Response) {
  try {
    const { id } = idParamSchema.parse(req.params);
    await deleteSubject(id);
    res.json({ success: true, data: null, error: null });
  } catch (error) {
    console.log("deleteSubjectHandler failed", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, data: null, error: "Invalid request" });
    }
    if (error instanceof Error && error.message === "Subject not found") {
      return res.status(404).json({ success: false, data: null, error: error.message });
    }
    res.status(500).json({ success: false, data: null, error: "Failed to delete subject" });
  }
}
