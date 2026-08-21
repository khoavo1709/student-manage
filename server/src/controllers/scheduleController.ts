import { Request, Response } from "express";
import { z } from "zod";
import {
  createSchedule,
  deleteSchedule,
  getScheduleById,
  listSchedules,
  updateSchedule,
} from "../services/scheduleService";

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const listQuerySchema = z.object({
  classId: z.coerce.number().int().positive().optional(),
});

const scheduleBodySchema = z
  .object({
    classId: z.number().int().positive(),
    dayOfWeek: z.number().int().min(0).max(6),
    startTime: z.string().regex(TIME_REGEX, "startTime must match HH:MM"),
    endTime: z.string().regex(TIME_REGEX, "endTime must match HH:MM"),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: "startDate must be before or equal to endDate",
    path: ["endDate"],
  });

const scheduleUpdateSchema = z
  .object({
    classId: z.number().int().positive().optional(),
    dayOfWeek: z.number().int().min(0).max(6).optional(),
    startTime: z.string().regex(TIME_REGEX, "startTime must match HH:MM").optional(),
    endTime: z.string().regex(TIME_REGEX, "endTime must match HH:MM").optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  })
  .refine(
    (data) =>
      !data.startDate || !data.endDate || data.startDate <= data.endDate,
    {
      message: "startDate must be before or equal to endDate",
      path: ["endDate"],
    }
  );

export async function listSchedulesHandler(req: Request, res: Response) {
  try {
    const query = listQuerySchema.parse(req.query);
    const schedules = await listSchedules(query);
    res.json({ success: true, data: schedules, error: null });
  } catch (error) {
    console.log("listSchedulesHandler failed", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, data: null, error: "Invalid query params" });
    }
    res.status(500).json({ success: false, data: null, error: "Failed to list schedules" });
  }
}

export async function getScheduleByIdHandler(req: Request, res: Response) {
  try {
    const { id } = idParamSchema.parse(req.params);
    const schedule = await getScheduleById(id);
    res.json({ success: true, data: schedule, error: null });
  } catch (error) {
    console.log("getScheduleByIdHandler failed", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, data: null, error: "Invalid request" });
    }
    if (error instanceof Error && error.message === "Schedule not found") {
      return res.status(404).json({ success: false, data: null, error: error.message });
    }
    res.status(500).json({ success: false, data: null, error: "Failed to get schedule" });
  }
}

export async function createScheduleHandler(req: Request, res: Response) {
  try {
    const body = scheduleBodySchema.parse(req.body);
    const schedule = await createSchedule(body);
    res.status(201).json({ success: true, data: schedule, error: null });
  } catch (error) {
    console.log("createScheduleHandler failed", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, data: null, error: "Invalid request body" });
    }
    res.status(500).json({ success: false, data: null, error: "Failed to create schedule" });
  }
}

export async function updateScheduleHandler(req: Request, res: Response) {
  try {
    const { id } = idParamSchema.parse(req.params);
    const body = scheduleUpdateSchema.parse(req.body);
    const schedule = await updateSchedule(id, body);
    res.json({ success: true, data: schedule, error: null });
  } catch (error) {
    console.log("updateScheduleHandler failed", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, data: null, error: "Invalid request" });
    }
    if (error instanceof Error && error.message === "Schedule not found") {
      return res.status(404).json({ success: false, data: null, error: error.message });
    }
    res.status(500).json({ success: false, data: null, error: "Failed to update schedule" });
  }
}

export async function deleteScheduleHandler(req: Request, res: Response) {
  try {
    const { id } = idParamSchema.parse(req.params);
    await deleteSchedule(id);
    res.json({ success: true, data: null, error: null });
  } catch (error) {
    console.log("deleteScheduleHandler failed", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, data: null, error: "Invalid request" });
    }
    if (error instanceof Error && error.message === "Schedule not found") {
      return res.status(404).json({ success: false, data: null, error: error.message });
    }
    res.status(500).json({ success: false, data: null, error: "Failed to delete schedule" });
  }
}
