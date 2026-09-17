"use server";

import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/current-user";
import type { ShiftPeriod } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createPreShiftPlan(formData: FormData) {
  const user = await requireCurrentUser();

  const shift = formData.get("shift") as ShiftPeriod;
  const bigIdea = formData.get("bigIdea") as string;
  const clearAction = formData.get("clearAction") as string;
  const energyWord = formData.get("energyWord") as string;
  const question1 = formData.get("question1") as string;
  const question2 = formData.get("question2") as string;
  const eightySixes = formData.get("eightySixes") as string;

  await prisma.preShiftPlan.create({
    data: {
      outletId: user.outletId,
      leadId: user.id,
      date: new Date(),
      shift,
      bigIdea,
      clearAction,
      energyWord,
      question1,
      question2,
      eightySixes: eightySixes || null,
    },
  });

  revalidatePath("/pre-shift");
}
