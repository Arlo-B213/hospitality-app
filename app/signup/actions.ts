"use server";

import { prisma } from "@/lib/prisma";
import { createSessionCookie, hashPassword } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { OutletTier, Role } from "@prisma/client";

// Validate password against security requirements
function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 12) {
    errors.push("at least 12 characters");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("at least 1 uppercase letter (A-Z)");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("at least 1 number (0-9)");
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push("at least 1 special character (!@#$%^&*)");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

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

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    const requirements = passwordValidation.errors.join(", ");
    return {
      error: `Password must have ${requirements}.`,
    };
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
