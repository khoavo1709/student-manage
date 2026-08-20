import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

export interface ListRemarksParams {
  studentId?: number;
}

export async function listRemarks(params: ListRemarksParams) {
  const where: Prisma.RemarkWhereInput = params.studentId
    ? { studentId: params.studentId }
    : {};
  return prisma.remark.findMany({ where, orderBy: { id: "asc" } });
}

export async function getRemarkById(id: number) {
  const remark = await prisma.remark.findUnique({ where: { id } });
  if (!remark) {
    throw new Error("Remark not found");
  }
  return remark;
}

export async function createRemark(data: Prisma.RemarkUncheckedCreateInput) {
  return prisma.remark.create({ data });
}

export async function updateRemark(id: number, data: Prisma.RemarkUncheckedUpdateInput) {
  await getRemarkById(id);
  return prisma.remark.update({ where: { id }, data });
}

export async function deleteRemark(id: number) {
  await getRemarkById(id);
  return prisma.remark.delete({ where: { id } });
}
