import { prisma } from "../lib/prisma";

export async function listClasses(includeStudents: boolean) {
  return prisma.class.findMany({
    include: includeStudents ? { students: true } : undefined,
    orderBy: { id: "asc" },
  });
}

export async function getClassById(id: number, includeStudents: boolean) {
  const classRecord = await prisma.class.findUnique({
    where: { id },
    include: includeStudents ? { students: true } : undefined,
  });
  if (!classRecord) {
    throw new Error("Class not found");
  }
  return classRecord;
}

export async function createClass(name: string) {
  return prisma.class.create({ data: { name } });
}

export async function updateClass(id: number, name: string) {
  await getClassById(id, false);
  return prisma.class.update({ where: { id }, data: { name } });
}

export async function deleteClass(id: number) {
  await getClassById(id, false);
  return prisma.class.delete({ where: { id } });
}
