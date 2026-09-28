import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/current-user";
import { createPreShiftPlan } from "./actions";
import PreShiftClient from "@/components/PreShiftClient";

const BIG_IDEA_LIBRARY = [
  { focus: "Active Listening", idea: "Repeat it back before you ring it.", action: "Cashier repeats the order back in their own words before hitting total" },
  { focus: "The First Look", idea: "Eyes up before words out.", action: "Acknowledge the guest with eye contact before saying anything else" },
  { focus: "Own It, Don't Toss It", idea: "If you hear it, you own it.", action: "Whoever hears a complaint stays with the guest until it's resolved or properly handed off" },
  { focus: "Empathy", idea: "Guess their day before you guess their order.", action: "Notice one visible cue (rushed, tired, celebrating) and adjust tone accordingly" },
  { focus: "The Send-Off", idea: "Name the item, not just 'enjoy.'", action: "Close every transaction referencing the specific item(s) purchased" },
];

export default async function PreShiftPage() {
  const user = await requireCurrentUser();
  const plans = await prisma.preShiftPlan.findMany({
    where: { outletId: user.outletId },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { outlet: true, lead: true },
  });

  return (
    <PreShiftClient
      user={user}
      plans={plans}
      bigIdeaLibrary={BIG_IDEA_LIBRARY}
      submitAction={createPreShiftPlan}
    />
  );
}
