import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

export interface ListScoresParams {
  studentId?: number;
  classId?: number;
}

const scoreInclude = {
  student: { select: { id: true, fullName: true } },
  class: { select: { id: true, name: true } },
} as const;

export async function listScores(params: ListScoresParams) {
  const where: Prisma.ScoreWhereInput = {
    ...(params.studentId ? { studentId: params.studentId } : {}),
    ...(params.classId ? { classId: params.classId } : {}),
  };
  return prisma.score.findMany({ where, include: scoreInclude, orderBy: { id: "asc" } });
}

export async function getScoreById(id: number) {
  const score = await prisma.score.findUnique({ where: { id }, include: scoreInclude });
  if (!score) {
    throw new Error("Score not found");
  }
  return score;
}

export async function createScore(data: Prisma.ScoreUncheckedCreateInput) {
  return prisma.score.create({ data });
}

export async function updateScore(id: number, data: Prisma.ScoreUncheckedUpdateInput) {
  await getScoreById(id);
  return prisma.score.update({ where: { id }, data });
}

export async function deleteScore(id: number) {
  await getScoreById(id);
  return prisma.score.delete({ where: { id } });
}
