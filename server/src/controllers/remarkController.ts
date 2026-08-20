import { Request, Response } from "express";
import { z } from "zod";
import {
  createRemark,
  deleteRemark,
  getRemarkById,
  listRemarks,
  updateRemark,
} from "../services/remarkService";

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const listQuerySchema = z.object({
  studentId: z.coerce.number().int().positive().optional(),
});

const remarkBodySchema = z.object({
  studentId: z.number().int().positive(),
  content: z.string().min(1),
  date: z.coerce.date().optional(),
});

const remarkUpdateSchema = remarkBodySchema.partial();

export async function listRemarksHandler(req: Request, res: Response) {
  try {
    const query = listQuerySchema.parse(req.query);
    const remarks = await listRemarks(query);
    res.json({ success: true, data: remarks, error: null });
  } catch (error) {
    console.log("listRemarksHandler failed", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, data: null, error: "Invalid query params" });
    }
    res.status(500).json({ success: false, data: null, error: "Failed to list remarks" });
  }
}

export async function getRemarkByIdHandler(req: Request, res: Response) {
  try {
    const { id } = idParamSchema.parse(req.params);
    const remark = await getRemarkById(id);
    res.json({ success: true, data: remark, error: null });
  } catch (error) {
    console.log("getRemarkByIdHandler failed", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, data: null, error: "Invalid request" });
    }
    if (error instanceof Error && error.message === "Remark not found") {
      return res.status(404).json({ success: false, data: null, error: error.message });
    }
    res.status(500).json({ success: false, data: null, error: "Failed to get remark" });
  }
}

export async function createRemarkHandler(req: Request, res: Response) {
  try {
    const body = remarkBodySchema.parse(req.body);
    const remark = await createRemark(body);
    res.status(201).json({ success: true, data: remark, error: null });
  } catch (error) {
    console.log("createRemarkHandler failed", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, data: null, error: "Invalid request body" });
    }
    res.status(500).json({ success: false, data: null, error: "Failed to create remark" });
  }
}

export async function updateRemarkHandler(req: Request, res: Response) {
  try {
    const { id } = idParamSchema.parse(req.params);
    const body = remarkUpdateSchema.parse(req.body);
    const remark = await updateRemark(id, body);
    res.json({ success: true, data: remark, error: null });
  } catch (error) {
    console.log("updateRemarkHandler failed", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, data: null, error: "Invalid request" });
    }
    if (error instanceof Error && error.message === "Remark not found") {
      return res.status(404).json({ success: false, data: null, error: error.message });
    }
    res.status(500).json({ success: false, data: null, error: "Failed to update remark" });
  }
}

export async function deleteRemarkHandler(req: Request, res: Response) {
  try {
    const { id } = idParamSchema.parse(req.params);
    await deleteRemark(id);
    res.json({ success: true, data: null, error: null });
  } catch (error) {
    console.log("deleteRemarkHandler failed", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, data: null, error: "Invalid request" });
    }
    if (error instanceof Error && error.message === "Remark not found") {
      return res.status(404).json({ success: false, data: null, error: error.message });
    }
    res.status(500).json({ success: false, data: null, error: "Failed to delete remark" });
  }
}
