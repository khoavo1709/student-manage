import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

export interface ListHomeworksParams {
  studentId?: number;
  subjectId?: number;
  status?: string;
}

export async function listHomeworks(params: ListHomeworksParams) {
  const where: Prisma.HomeworkWhereInput = {
    ...(params.studentId ? { studentId: params.studentId } : {}),
    ...(params.subjectId ? { subjectId: params.subjectId } : {}),
    ...(params.status ? { status: params.status } : {}),
  };
  return prisma.homework.findMany({ where, orderBy: { id: "asc" } });
}

export async function getHomeworkById(id: number) {
  const homework = await prisma.homework.findUnique({ where: { id } });
  if (!homework) {
    throw new Error("Homework not found");
  }
  return homework;
}

export async function createHomework(data: Prisma.HomeworkUncheckedCreateInput) {
  return prisma.homework.create({ data });
}

export async function updateHomework(id: number, data: Prisma.HomeworkUncheckedUpdateInput) {
  await getHomeworkById(id);
  return prisma.homework.update({ where: { id }, data });
}

export async function deleteHomework(id: number) {
  await getHomeworkById(id);
  return prisma.homework.delete({ where: { id } });
}
