import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

export interface ListSchedulesParams {
  classId?: number;
}

export async function listSchedules(params: ListSchedulesParams) {
  const where: Prisma.ScheduleWhereInput = params.classId
    ? { classId: params.classId }
    : {};
  return prisma.schedule.findMany({ where, orderBy: { id: "asc" } });
}

export async function getScheduleById(id: number) {
  const schedule = await prisma.schedule.findUnique({ where: { id } });
  if (!schedule) {
    throw new Error("Schedule not found");
  }
  return schedule;
}

export async function createSchedule(data: Prisma.ScheduleUncheckedCreateInput) {
  return prisma.schedule.create({ data });
}

export async function updateSchedule(id: number, data: Prisma.ScheduleUncheckedUpdateInput) {
  await getScheduleById(id);
  return prisma.schedule.update({ where: { id }, data });
}

export async function deleteSchedule(id: number) {
  await getScheduleById(id);
  return prisma.schedule.delete({ where: { id } });
}
