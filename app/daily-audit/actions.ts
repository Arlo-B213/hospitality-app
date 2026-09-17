"use server";

import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/current-user";
import type { CheckStatus, ShiftPeriod } from "@prisma/client";
import { revalidatePath } from "next/cache";

const SKILLS = [
  "activeListening",
  "empathy",
  "adaptability",
  "teamwork",
  "conflictResolution",
  "stressTolerance",
  "timeManagement",
  "attentionToDetail",
] as const;

export async function createDailyAudit(formData: FormData) {
  const user = await requireCurrentUser();
  const shift = formData.get("shift") as ShiftPeriod;

  const softSkillTallies: Record<string, number> = {};
  for (const skill of SKILLS) {
    softSkillTallies[skill] = Number(formData.get(`tally_${skill}`) || 0);
  }

  await prisma.dailyAudit.create({
    data: {
      outletId: user.outletId,
      leadId: user.id,
      date: new Date(),
      shift,
      transactionsObserved: Number(formData.get("transactionsObserved") || 0),
      openerStatus: statusOrNull(formData.get("openerStatus")),
      openerMissCount: Number(formData.get("openerMissCount") || 0),
      closeStatus: statusOrNull(formData.get("closeStatus")),
      closeMissCount: Number(formData.get("closeMissCount") || 0),
      orderAccuracyCorrect: Number(formData.get("orderAccuracyCorrect") || 0),
      orderAccuracyTotal: Number(formData.get("orderAccuracyTotal") || 0),
      avgTicketTimeSeconds: numOrNull(formData.get("avgTicketTimeSeconds")),
      ticketTimeStandard: numOrNull(formData.get("ticketTimeStandard")),
      peakTicketTimeSeconds: numOrNull(formData.get("peakTicketTimeSeconds")),
      peakCause: (formData.get("peakCause") as string) || null,
      eightySixedItems: (formData.get("eightySixedItems") as string) || null,
      softSkillTallies: JSON.stringify(softSkillTallies),
      momentOfShift: (formData.get("momentOfShift") as string) || null,
      coachingNeeded: (formData.get("coachingNeeded") as string) || null,
      nonNeg1Status: statusOrNull(formData.get("nonNeg1Status")),
      nonNeg2Status: statusOrNull(formData.get("nonNeg2Status")),
      nonNeg3Status: statusOrNull(formData.get("nonNeg3Status")),
    },
  });

  revalidatePath("/daily-audit");
}

function numOrNull(v: FormDataEntryValue | null) {
  if (!v || v === "") return null;
  return Number(v);
}

function statusOrNull(v: FormDataEntryValue | null): CheckStatus | null {
  if (!v || v === "") return null;
  return v as CheckStatus;
}
