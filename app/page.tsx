import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/current-user";

const MODULES = [
  {
    href: "/pre-shift",
    title: "Pre-Shift Builder",
    desc: "The 5-minute engine start: Focus, Clarity, Energy, Interactive.",
  },
  {
    href: "/daily-audit",
    title: "Daily Audit & Recap Log",
    desc: "Shift-lead close-out: transaction standards, ticket times, soft-skill spot checks, non-negotiables.",
  },
  {
    href: "/quiz",
    title: "Situational Quiz",
    desc: "120 floor-real scenarios mapped to the 5 Pillars, filtered to your outlet's tier.",
  },
  {
    href: "/assessment",
    title: "Skills Assessment",
    desc: "Self vs. supervisor rubric scoring across the 5 Pillars, with archetype reveal.",
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
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">
          A Complete Hospitality Leadership & Soft Skills Development System
        </h1>
        <p className="mt-2 text-neutral-400 max-w-3xl">
          Build the system once, make it repeatable, then trust your people
          to run it. Five pillars, four floor modules, one operating system
          for how leaders think under pressure.
        </p>
        <p className="mt-2 text-sm text-neutral-500">
          {user.outlet.name} · {user.outlet.tier.replace("_", " ")}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <Stat label="Team members" value={userCount} />
        <Stat label="Daily audits logged" value={auditCount} />
        <Stat label="Pre-shifts logged" value={preShiftCount} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {MODULES.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="block rounded-lg border border-neutral-800 p-5 hover:border-neutral-600 transition-colors"
          >
            <h2 className="font-medium">{m.title}</h2>
            <p className="mt-1 text-sm text-neutral-400">{m.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-neutral-800 p-4">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-neutral-400">{label}</div>
    </div>
  );
}
