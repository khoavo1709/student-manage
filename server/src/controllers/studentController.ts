import { Request, Response } from "express";
import { z } from "zod";
import {
  createStudent,
  deleteStudent,
  getStudentById,
  listStudents,
  updateStudent,
} from "../services/studentService";

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(10),
  classId: z.coerce.number().int().positive().optional(),
});

const studentBodySchema = z.object({
  fullName: z.string().min(1),
  dateOfBirth: z.coerce.date(),
  gender: z.string().min(1),
  address: z.string().optional().nullable(),
  guardianName: z.string().optional().nullable(),
  guardianPhone: z.string().optional().nullable(),
  guardianRelation: z.string().optional().nullable(),
  classIds: z.array(z.number().int().positive()).optional().default([]),
});

const studentUpdateSchema = studentBodySchema.partial();

export async function listStudentsHandler(req: Request, res: Response) {
  try {
    const { page, limit, classId } = listQuerySchema.parse(req.query);
    const result = await listStudents({ page, limit, classId });
    res.json({ success: true, data: result, error: null });
  } catch (error) {
    console.log("listStudentsHandler failed", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, data: null, error: "Invalid query params" });
    }
    res.status(500).json({ success: false, data: null, error: "Failed to list students" });
  }
}

export async function getStudentByIdHandler(req: Request, res: Response) {
  try {
    const { id } = idParamSchema.parse(req.params);
    const student = await getStudentById(id);
    res.json({ success: true, data: student, error: null });
  } catch (error) {
    console.log("getStudentByIdHandler failed", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, data: null, error: "Invalid request" });
    }
    if (error instanceof Error && error.message === "Student not found") {
      return res.status(404).json({ success: false, data: null, error: error.message });
    }
    res.status(500).json({ success: false, data: null, error: "Failed to get student" });
  }
}

export async function createStudentHandler(req: Request, res: Response) {
  try {
    const body = studentBodySchema.parse(req.body);
    const student = await createStudent(body);
    res.status(201).json({ success: true, data: student, error: null });
  } catch (error) {
    console.log("createStudentHandler failed", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, data: null, error: "Invalid request body" });
    }
    res.status(500).json({ success: false, data: null, error: "Failed to create student" });
  }
}

export async function updateStudentHandler(req: Request, res: Response) {
  try {
    const { id } = idParamSchema.parse(req.params);
    const body = studentUpdateSchema.parse(req.body);
    const student = await updateStudent(id, body);
    res.json({ success: true, data: student, error: null });
  } catch (error) {
    console.log("updateStudentHandler failed", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, data: null, error: "Invalid request" });
    }
    if (error instanceof Error && error.message === "Student not found") {
      return res.status(404).json({ success: false, data: null, error: error.message });
    }
    res.status(500).json({ success: false, data: null, error: "Failed to update student" });
  }
}

export async function deleteStudentHandler(req: Request, res: Response) {
  try {
    const { id } = idParamSchema.parse(req.params);
    await deleteStudent(id);
    res.json({ success: true, data: null, error: null });
  } catch (error) {
    console.log("deleteStudentHandler failed", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, data: null, error: "Invalid request" });
    }
    if (error instanceof Error && error.message === "Student not found") {
      return res.status(404).json({ success: false, data: null, error: error.message });
    }
    res.status(500).json({ success: false, data: null, error: "Failed to delete student" });
  }
}
