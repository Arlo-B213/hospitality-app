import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/current-user";
import { createDailyAudit } from "./actions";
import WeeklyHeatMap from "./WeeklyHeatMap";
import DailyAuditClient from "@/components/DailyAuditClient";

const SKILLS: { key: string; label: string }[] = [
  { key: "activeListening", label: "Active Listening" },
  { key: "empathy", label: "Empathy" },
  { key: "adaptability", label: "Adaptability" },
  { key: "teamwork", label: "Teamwork" },
  { key: "conflictResolution", label: "Conflict Resolution" },
  { key: "stressTolerance", label: "Stress Tolerance" },
  { key: "timeManagement", label: "Time Management" },
  { key: "attentionToDetail", label: "Attention to Detail" },
];

export default async function DailyAuditPage() {
  const user = await requireCurrentUser();
  const audits = await prisma.dailyAudit.findMany({
    where: { outletId: user.outletId },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { outlet: true, lead: true },
  });

  return (
    <DailyAuditClient
      user={user}
      skills={SKILLS}
      submitAction={createDailyAudit}
      audits={audits}
      WeeklyHeatMap={WeeklyHeatMap}
    />
  );
}
