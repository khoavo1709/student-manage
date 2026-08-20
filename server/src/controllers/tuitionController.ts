import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import {
  createTuition,
  deleteTuition,
  getTuitionById,
  listTuitions,
  updateTuition,
} from "../services/tuitionService";

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const listQuerySchema = z.object({
  studentId: z.coerce.number().int().positive().optional(),
  year: z.coerce.number().int().positive().optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
});

const tuitionBodySchema = z
  .object({
    studentId: z.number().int().positive(),
    amount: z.number(),
    year: z.number().int().positive(),
    month: z.number().int(),
    status: z.string().min(1),
    paidDate: z.coerce.date().optional().nullable(),
  })
  .refine((data) => data.month >= 1 && data.month <= 12, {
    message: "month must be between 1 and 12",
    path: ["month"],
  });

const tuitionUpdateSchema = z.object({
  studentId: z.number().int().positive().optional(),
  amount: z.number().optional(),
  year: z.number().int().positive().optional(),
  month: z.number().int().min(1).max(12).optional(),
  status: z.string().min(1).optional(),
  paidDate: z.coerce.date().optional().nullable(),
});

// P2002 is Prisma's unique constraint violation code; the schema enforces one
// Tuition per (studentId, year, month), so this is the expected duplicate case.
function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export async function listTuitionsHandler(req: Request, res: Response) {
  try {
    const query = listQuerySchema.parse(req.query);
    const tuitions = await listTuitions(query);
    res.json({ success: true, data: tuitions, error: null });
  } catch (error) {
    console.log("listTuitionsHandler failed", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, data: null, error: "Invalid query params" });
    }
    res.status(500).json({ success: false, data: null, error: "Failed to list tuitions" });
  }
}

export async function getTuitionByIdHandler(req: Request, res: Response) {
  try {
    const { id } = idParamSchema.parse(req.params);
    const tuition = await getTuitionById(id);
    res.json({ success: true, data: tuition, error: null });
  } catch (error) {
    console.log("getTuitionByIdHandler failed", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, data: null, error: "Invalid request" });
    }
    if (error instanceof Error && error.message === "Tuition not found") {
      return res.status(404).json({ success: false, data: null, error: error.message });
    }
    res.status(500).json({ success: false, data: null, error: "Failed to get tuition" });
  }
}

export async function createTuitionHandler(req: Request, res: Response) {
  try {
    const body = tuitionBodySchema.parse(req.body);
    const tuition = await createTuition(body);
    res.status(201).json({ success: true, data: tuition, error: null });
  } catch (error) {
    console.log("createTuitionHandler failed", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, data: null, error: "Invalid request body" });
    }
    if (isUniqueConstraintError(error)) {
      return res.status(409).json({
        success: false,
        data: null,
        error: "Tuition already exists for this student in this month",
      });
    }
    res.status(500).json({ success: false, data: null, error: "Failed to create tuition" });
  }
}

export async function updateTuitionHandler(req: Request, res: Response) {
  try {
    const { id } = idParamSchema.parse(req.params);
    const body = tuitionUpdateSchema.parse(req.body);
    const tuition = await updateTuition(id, body);
    res.json({ success: true, data: tuition, error: null });
  } catch (error) {
    console.log("updateTuitionHandler failed", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, data: null, error: "Invalid request" });
    }
    if (error instanceof Error && error.message === "Tuition not found") {
      return res.status(404).json({ success: false, data: null, error: error.message });
    }
    if (isUniqueConstraintError(error)) {
      return res.status(409).json({
        success: false,
        data: null,
        error: "Tuition already exists for this student in this month",
      });
    }
    res.status(500).json({ success: false, data: null, error: "Failed to update tuition" });
  }
}

export async function deleteTuitionHandler(req: Request, res: Response) {
  try {
    const { id } = idParamSchema.parse(req.params);
    await deleteTuition(id);
    res.json({ success: true, data: null, error: null });
  } catch (error) {
    console.log("deleteTuitionHandler failed", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, data: null, error: "Invalid request" });
    }
    if (error instanceof Error && error.message === "Tuition not found") {
      return res.status(404).json({ success: false, data: null, error: error.message });
    }
    res.status(500).json({ success: false, data: null, error: "Failed to delete tuition" });
  }
}
