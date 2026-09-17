"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function submitQuizAnswer(formData: FormData) {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Not authenticated");

  const scenarioId = formData.get("scenarioId") as string;
  const chosenAnswer = formData.get("chosenAnswer") as string;

  const scenario = await prisma.quizScenario.findUniqueOrThrow({
    where: { id: scenarioId },
  });

  await prisma.quizAttempt.create({
    data: {
      userId,
      scenarioId,
      chosenAnswer,
      correct: chosenAnswer === scenario.correctAnswer,
    },
  });

  revalidatePath("/quiz");
}
