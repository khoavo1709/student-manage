import { prisma } from "../lib/prisma";

export async function listSubjects() {
  return prisma.subject.findMany({ orderBy: { id: "asc" } });
}

export async function getSubjectById(id: number) {
  const subject = await prisma.subject.findUnique({ where: { id } });
  if (!subject) {
    throw new Error("Subject not found");
  }
  return subject;
}

export async function createSubject(name: string) {
  return prisma.subject.create({ data: { name } });
}

export async function updateSubject(id: number, name: string) {
  await getSubjectById(id);
  return prisma.subject.update({ where: { id }, data: { name } });
}

export async function deleteSubject(id: number) {
  await getSubjectById(id);
  return prisma.subject.delete({ where: { id } });
}
