"use server";

import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/current-user";
import type { Pillar, RubricLevel, ScoredBy } from "@prisma/client";
import { revalidatePath } from "next/cache";

const PILLARS = [
  "EMOTIONAL_INTELLIGENCE",
  "DECISIVENESS",
  "DELEGATION_ACCOUNTABILITY",
  "COACHING_DEVELOPING",
  "CROSS_FUNCTIONAL_COMMUNICATION",
] as const;

export async function submitAssessment(formData: FormData) {
  const currentUser = await requireCurrentUser();
  const targetUserId = formData.get("userId") as string;
  const scoredBy = formData.get("scoredBy") as ScoredBy;

  if (targetUserId === currentUser.id) {
    if (scoredBy !== "SELF") throw new Error("Score your own assessment as Self.");
  } else {
    const canScoreOthers = currentUser.role === "LEAD" || currentUser.role === "MANAGER";
    if (!canScoreOthers || scoredBy !== "SUPERVISOR") {
      throw new Error("Only leads/managers can submit a Supervisor score for someone else.");
    }
    const target = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!target || target.outletId !== currentUser.outletId) {
      throw new Error("Can only score team members at your own outlet.");
    }
  }

  for (const pillar of PILLARS) {
    const level = formData.get(`level_${pillar}`) as RubricLevel | "";
    if (!level) continue;
    await prisma.skillAssessment.create({
      data: {
        userId: targetUserId,
        pillar: pillar as Pillar,
        level,
        scoredBy,
      },
    });
  }

  revalidatePath("/assessment");
}
