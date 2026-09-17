import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function getCurrentUser() {
  const userId = await getSessionUserId();
  if (!userId) return null;
  return prisma.user.findUnique({
    where: { id: userId },
    include: { outlet: true },
  });
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
