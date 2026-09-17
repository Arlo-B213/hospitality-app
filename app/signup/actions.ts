"use server";

import { prisma } from "@/lib/prisma";
import { createSessionCookie, hashPassword } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { OutletTier, Role } from "@prisma/client";

export async function signup(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const role = formData.get("role") as Role;
  const outletMode = formData.get("outletMode") as "existing" | "new";

  if (!name || !email || !password) {
    return { error: "All fields are required." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with that email already exists." };
  }

  let outletId: string;
  if (outletMode === "new") {
    const outletName = (formData.get("newOutletName") as string)?.trim();
    const outletTier = formData.get("newOutletTier") as OutletTier;
    if (!outletName) return { error: "Outlet name is required." };
    const outlet = await prisma.outlet.create({
      data: { name: outletName, tier: outletTier },
    });
    outletId = outlet.id;
  } else {
    outletId = formData.get("outletId") as string;
    if (!outletId) return { error: "Select an outlet." };
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role, outletId },
  });

  await createSessionCookie(user.id);
  redirect("/");
}
