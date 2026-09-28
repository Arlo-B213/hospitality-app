import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/current-user";
import DashboardClient from "@/components/DashboardClient";

const MODULES = [
  {
    href: "/pre-shift",
    title: "Pre-Shift Builder",
    desc: "The 5-minute engine start: Focus, Clarity, Energy, Interactive.",
    icon: "Zap",
    color: "from-blue-500/20 to-blue-600/20",
  },
  {
    href: "/daily-audit",
    title: "Daily Audit & Recap Log",
    desc: "Shift-lead close-out: transaction standards, ticket times, soft-skill spot checks, non-negotiables.",
    icon: "FileText",
    color: "from-green-500/20 to-emerald-600/20",
  },
  {
    href: "/quiz",
    title: "Situational Quiz",
    desc: "120 floor-real scenarios mapped to the 5 Pillars, filtered to your outlet's tier.",
    icon: "BookOpen",
    color: "from-purple-500/20 to-purple-600/20",
  },
  {
    href: "/assessment",
    title: "Skills Assessment",
    desc: "Self vs. supervisor rubric scoring across the 5 Pillars, with archetype reveal.",
    icon: "Target",
    color: "from-red-500/20 to-red-600/20",
  },
];

export default async function Home() {
  const user = await requireCurrentUser();

  const [userCount, auditCount, preShiftCount] = await Promise.all([
    prisma.user.count({ where: { outletId: user.outletId } }),
    prisma.dailyAudit.count({ where: { outletId: user.outletId } }),
    prisma.preShiftPlan.count({ where: { outletId: user.outletId } }),
  ]);

  return (
    <DashboardClient
      user={user}
      userCount={userCount}
      auditCount={auditCount}
      preShiftCount={preShiftCount}
      modules={MODULES}
    />
  );
}
