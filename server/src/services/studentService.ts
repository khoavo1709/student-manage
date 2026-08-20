import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

export interface ListStudentsParams {
  page: number;
  limit: number;
  classId?: number;
}

export async function listStudents(params: ListStudentsParams) {
  const { page, limit, classId } = params;
  const where: Prisma.StudentWhereInput = classId ? { classId } : {};

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { id: "asc" },
    }),
    prisma.student.count({ where }),
  ]);

  return {
    students,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getStudentById(id: number) {
  const student = await prisma.student.findUnique({
    where: { id },
    include: { class: { select: { id: true, name: true } } },
  });
  if (!student) {
    throw new Error("Student not found");
  }
  return student;
}

export async function createStudent(data: Prisma.StudentUncheckedCreateInput) {
  return prisma.student.create({ data });
}

export async function updateStudent(id: number, data: Prisma.StudentUncheckedUpdateInput) {
  await getStudentById(id);
  return prisma.student.update({ where: { id }, data });
}

export async function deleteStudent(id: number) {
  await getStudentById(id);
  return prisma.student.delete({ where: { id } });
}
