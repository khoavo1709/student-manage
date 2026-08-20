import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

export interface ListTuitionsParams {
  studentId?: number;
  year?: number;
  month?: number;
}

export async function listTuitions(params: ListTuitionsParams) {
  const where: Prisma.TuitionWhereInput = {
    ...(params.studentId ? { studentId: params.studentId } : {}),
    ...(params.year ? { year: params.year } : {}),
    ...(params.month ? { month: params.month } : {}),
  };
  return prisma.tuition.findMany({ where, orderBy: { id: "asc" } });
}

export async function getTuitionById(id: number) {
  const tuition = await prisma.tuition.findUnique({ where: { id } });
  if (!tuition) {
    throw new Error("Tuition not found");
  }
  return tuition;
}

export async function createTuition(data: Prisma.TuitionUncheckedCreateInput) {
  return prisma.tuition.create({ data });
}

export async function updateTuition(id: number, data: Prisma.TuitionUncheckedUpdateInput) {
  await getTuitionById(id);
  return prisma.tuition.update({ where: { id }, data });
}

export async function deleteTuition(id: number) {
  await getTuitionById(id);
  return prisma.tuition.delete({ where: { id } });
}
