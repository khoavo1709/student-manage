import { Request, Response } from "express";
import { z } from "zod";
import {
  createClass,
  deleteClass,
  getClassById,
  listClasses,
  updateClass,
} from "../services/classService";

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const listQuerySchema = z.object({
  includeStudents: z
    .union([z.literal("true"), z.literal("false")])
    .optional(),
});

const classBodySchema = z.object({
  name: z.string().min(1),
});

export async function listClassesHandler(req: Request, res: Response) {
  try {
    const { includeStudents } = listQuerySchema.parse(req.query);
    const classes = await listClasses(includeStudents === "true");
    res.json({ success: true, data: classes, error: null });
  } catch (error) {
    console.log("listClassesHandler failed", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, data: null, error: "Invalid query params" });
    }
    res.status(500).json({ success: false, data: null, error: "Failed to list classes" });
  }
}

export async function getClassByIdHandler(req: Request, res: Response) {
  try {
    const { id } = idParamSchema.parse(req.params);
    const { includeStudents } = listQuerySchema.parse(req.query);
    const classRecord = await getClassById(id, includeStudents === "true");
    res.json({ success: true, data: classRecord, error: null });
  } catch (error) {
    console.log("getClassByIdHandler failed", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, data: null, error: "Invalid request" });
    }
    if (error instanceof Error && error.message === "Class not found") {
      return res.status(404).json({ success: false, data: null, error: error.message });
    }
    res.status(500).json({ success: false, data: null, error: "Failed to get class" });
  }
}

export async function createClassHandler(req: Request, res: Response) {
  try {
    const { name } = classBodySchema.parse(req.body);
    const classRecord = await createClass(name);
    res.status(201).json({ success: true, data: classRecord, error: null });
  } catch (error) {
    console.log("createClassHandler failed", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, data: null, error: "Invalid request body" });
    }
    res.status(500).json({ success: false, data: null, error: "Failed to create class" });
  }
}

export async function updateClassHandler(req: Request, res: Response) {
  try {
    const { id } = idParamSchema.parse(req.params);
    const { name } = classBodySchema.parse(req.body);
    const classRecord = await updateClass(id, name);
    res.json({ success: true, data: classRecord, error: null });
  } catch (error) {
    console.log("updateClassHandler failed", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, data: null, error: "Invalid request" });
    }
    if (error instanceof Error && error.message === "Class not found") {
      return res.status(404).json({ success: false, data: null, error: error.message });
    }
    res.status(500).json({ success: false, data: null, error: "Failed to update class" });
  }
}

export async function deleteClassHandler(req: Request, res: Response) {
  try {
    const { id } = idParamSchema.parse(req.params);
    await deleteClass(id);
    res.json({ success: true, data: null, error: null });
  } catch (error) {
    console.log("deleteClassHandler failed", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, data: null, error: "Invalid request" });
    }
    if (error instanceof Error && error.message === "Class not found") {
      return res.status(404).json({ success: false, data: null, error: error.message });
    }
    res.status(500).json({ success: false, data: null, error: "Failed to delete class" });
  }
}
