import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { env } from "../lib/env";

export async function login(username: string, password: string) {
  const admin = await prisma.admin.findUnique({ where: { username } });
  if (!admin) {
    throw new Error("Invalid username or password");
  }

  const isValid = await bcrypt.compare(password, admin.password);
  if (!isValid) {
    throw new Error("Invalid username or password");
  }

  const token = jwt.sign({ adminId: admin.id }, env.jwtSecret, { expiresIn: "7d" });
  return { token, username: admin.username };
}
