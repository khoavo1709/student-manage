import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

export interface ListTuitionsParams {
  studentId?: number;
  classId?: number;
  year?: number;
  month?: number;
}

const tuitionInclude = {
  student: { select: { id: true, fullName: true } },
  class: { select: { id: true, name: true, tuitionFee: true } },
} as const;

export async function listTuitions(params: ListTuitionsParams) {
  const where: Prisma.TuitionWhereInput = {
    ...(params.studentId ? { studentId: params.studentId } : {}),
    ...(params.classId ? { classId: params.classId } : {}),
    ...(params.year ? { year: params.year } : {}),
    ...(params.month ? { month: params.month } : {}),
  };
  return prisma.tuition.findMany({ where, include: tuitionInclude, orderBy: { id: "asc" } });
}

export async function getTuitionById(id: number) {
  const tuition = await prisma.tuition.findUnique({ where: { id }, include: tuitionInclude });
  if (!tuition) {
    throw new Error("Tuition not found");
  }
  return tuition;
}

export async function createTuition(data: Prisma.TuitionUncheckedCreateInput) {
  return prisma.tuition.create({ data, include: tuitionInclude });
}

export async function updateTuition(id: number, data: Prisma.TuitionUncheckedUpdateInput) {
  await getTuitionById(id);
  return prisma.tuition.update({ where: { id }, data, include: tuitionInclude });
}

export async function deleteTuition(id: number) {
  await getTuitionById(id);
  return prisma.tuition.delete({ where: { id } });
}

export interface PayTuitionsInput {
  studentId: number;
  classId: number;
  months: { year: number; month: number }[];
  paidDate: Date;
}

// Danh dau "da dong" cho nhieu thang cung luc: thang chua co ban ghi thi tao moi,
// da co thi cap nhat. Chay trong 1 transaction de khong bi luu nua chung.
export async function payTuitions({ studentId, classId, months, paidDate }: PayTuitionsInput) {
  return prisma.$transaction(
    months.map(({ year, month }) =>
      prisma.tuition.upsert({
        where: { studentId_classId_year_month: { studentId, classId, year, month } },
        create: { studentId, classId, year, month, status: "da dong", paidDate },
        update: { status: "da dong", paidDate },
        include: tuitionInclude,
      })
    )
  );
}
