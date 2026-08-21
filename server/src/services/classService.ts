import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

export async function listClasses(includeStudents: boolean) {
  return prisma.class.findMany({
    include: includeStudents ? { students: { include: { student: true } } } : undefined,
    orderBy: { id: "asc" },
  });
}

export async function getClassById(id: number, includeStudents: boolean) {
  const classRecord = await prisma.class.findUnique({
    where: { id },
    include: includeStudents ? { students: { include: { student: true } } } : undefined,
  });
  if (!classRecord) {
    throw new Error("Class not found");
  }
  return classRecord;
}

export async function createClass(data: Prisma.ClassUncheckedCreateInput) {
  return prisma.class.create({ data });
}

export async function updateClass(id: number, data: Prisma.ClassUncheckedUpdateInput) {
  await getClassById(id, false);
  return prisma.class.update({ where: { id }, data });
}

export async function deleteClass(id: number) {
  await getClassById(id, false);
  return prisma.class.delete({ where: { id } });
}
