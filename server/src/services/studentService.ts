import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

export interface ListStudentsParams {
  page: number;
  limit: number;
  classId?: number;
}

const studentInclude = {
  classes: { include: { class: true } },
} as const;

export async function listStudents(params: ListStudentsParams) {
  const { page, limit, classId } = params;
  const where: Prisma.StudentWhereInput = classId
    ? { classes: { some: { classId } } }
    : {};

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      include: studentInclude,
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
    include: studentInclude,
  });
  if (!student) {
    throw new Error("Student not found");
  }
  return student;
}

export interface StudentInput {
  fullName: string;
  dateOfBirth: Date;
  gender: string;
  address?: string | null;
  guardianName?: string | null;
  guardianPhone?: string | null;
  guardianRelation?: string | null;
  classIds?: number[];
}

export async function createStudent(data: StudentInput) {
  const { classIds = [], ...studentData } = data;
  return prisma.student.create({
    data: {
      ...studentData,
      classes: { create: classIds.map((classId) => ({ classId })) },
    },
    include: studentInclude,
  });
}

export async function updateStudent(id: number, data: Partial<StudentInput>) {
  await getStudentById(id);
  const { classIds, ...studentData } = data;

  return prisma.student.update({
    where: { id },
    data: {
      ...studentData,
      ...(classIds
        ? {
            classes: {
              deleteMany: {},
              create: classIds.map((classId) => ({ classId })),
            },
          }
        : {}),
    },
    include: studentInclude,
  });
}

export async function deleteStudent(id: number) {
  await getStudentById(id);
  return prisma.student.delete({ where: { id } });
}
