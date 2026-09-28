import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/current-user";
import { submitAssessment } from "./actions";
import AssessmentClient from "@/components/AssessmentClient";

const PILLARS: { key: string; label: string }[] = [
  { key: "EMOTIONAL_INTELLIGENCE", label: "Emotional Intelligence (Reading the Room)" },
  { key: "DECISIVENESS", label: "Decisiveness Under Pressure" },
  { key: "DELEGATION_ACCOUNTABILITY", label: "Delegation & Accountability" },
  { key: "COACHING_DEVELOPING", label: "Coaching & Developing Others" },
  { key: "CROSS_FUNCTIONAL_COMMUNICATION", label: "Cross-Functional Communication" },
];

const LEVEL_VALUE: Record<string, number> = {
  EMERGING: 1,
  DEVELOPING: 2,
  SKILLED: 3,
  MASTERY: 4,
};

const ARCHETYPES: { pair: string[]; name: string; desc: string }[] = [
  {
    pair: ["DECISIVENESS", "EMOTIONAL_INTELLIGENCE"],
    name: "The High-Volume Catalyst",
    desc: "Thrives where speed and chaos collide — best deployed where volume, not nuance, is the daily test.",
  },
  {
    pair: ["DELEGATION_ACCOUNTABILITY", "EMOTIONAL_INTELLIGENCE"],
    name: "The Floor Choreographer",
    desc: "Builds a team that runs like a rehearsed dance without needing constant direction.",
  },
  {
    pair: ["EMOTIONAL_INTELLIGENCE", "CROSS_FUNCTIONAL_COMMUNICATION"],
    name: "The Guest Experience Architect",
    desc: "Designs the feel of a shift, not just the transactions.",
  },
  {
    pair: ["CROSS_FUNCTIONAL_COMMUNICATION", "COACHING_DEVELOPING"],
    name: "The Bridge Builder",
    desc: "The translator between floor and office.",
  },
  {
    pair: ["COACHING_DEVELOPING", "DELEGATION_ACCOUNTABILITY"],
    name: "The Talent Grower",
    desc: "Builds people, not just shifts.",
  },
];

function computeArchetype(topTwo: string[]) {
  return ARCHETYPES.find((a) => a.pair.every((p) => topTwo.includes(p)) && topTwo.length === 2);
}

export default async function AssessmentPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string }>;
}) {
  const currentUser = await requireCurrentUser();
  const canViewOthers = currentUser.role === "LEAD" || currentUser.role === "MANAGER";

  const { userId } = await searchParams;
  const outletUsers = canViewOthers
    ? await prisma.user.findMany({ where: { outletId: currentUser.outletId } })
    : [currentUser];

  const requestedId = canViewOthers ? userId : currentUser.id;
  const activeUserId =
    requestedId && outletUsers.some((u) => u.id === requestedId)
      ? requestedId
      : currentUser.id;
  const isSelf = activeUserId === currentUser.id;

  const assessments = await prisma.skillAssessment.findMany({
    where: { userId: activeUserId },
    orderBy: { date: "desc" },
  });

  const latestByPillarAndScorer = new Map<string, (typeof assessments)[number]>();
  for (const a of assessments) {
    const key = `${a.pillar}_${a.scoredBy}`;
    if (!latestByPillarAndScorer.has(key)) latestByPillarAndScorer.set(key, a);
  }

  const overallByPillar = new Map<string, number>();
  for (const p of PILLARS) {
    const self = latestByPillarAndScorer.get(`${p.key}_SELF`);
    const sup = latestByPillarAndScorer.get(`${p.key}_SUPERVISOR`);
    const values = [self, sup].filter(Boolean).map((a) => LEVEL_VALUE[a!.level]);
    if (values.length > 0) {
      overallByPillar.set(p.key, values.reduce((a, b) => a + b, 0) / values.length);
    }
  }

  const ranked = [...overallByPillar.entries()].sort((a, b) => b[1] - a[1]);
  const topTwo = ranked.slice(0, 2).map(([k]) => k);
  const archetype = topTwo.length === 2 ? computeArchetype(topTwo) : undefined;

  return (
    <AssessmentClient
      currentUser={currentUser}
      canViewOthers={canViewOthers}
      outletUsers={outletUsers}
      activeUserId={activeUserId}
      isSelf={isSelf}
      pillars={PILLARS}
      submitAction={submitAssessment}
      ranked={ranked}
      archetype={archetype}
    />
  );
}
