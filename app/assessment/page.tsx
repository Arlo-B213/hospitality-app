import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/current-user";
import { submitAssessment } from "./actions";

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
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">Skills Assessment</h1>
        <p className="mt-2 text-neutral-400 max-w-2xl">
          Score behavior on the floor, not a number out of context. Self-score,
          then have the direct supervisor score independently — the gap is
          often the most useful coaching conversation in the program.
        </p>
      </div>

      {canViewOthers && (
        <form method="get" className="max-w-xs flex items-end gap-2">
          <label className="block space-y-1 flex-1">
            <span className="text-sm text-neutral-400">Viewing</span>
            <select
              name="userId"
              defaultValue={activeUserId}
              className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm"
            >
              {outletUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} {u.id === currentUser.id ? "(me)" : ""}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="rounded border border-neutral-700 px-3 py-2 text-sm hover:border-neutral-500"
          >
            Switch
          </button>
        </form>
      )}

      <form action={submitAssessment} className="space-y-5 max-w-2xl">
        <input type="hidden" name="userId" value={activeUserId} />
        <input type="hidden" name="scoredBy" value={isSelf ? "SELF" : "SUPERVISOR"} />
        <p className="text-sm text-neutral-500">
          Scoring{" "}
          <span className="text-neutral-300">
            {isSelf ? "yourself (Self)" : `${outletUsers.find((u) => u.id === activeUserId)?.name} (Supervisor)`}
          </span>
        </p>

        {PILLARS.map((p) => (
          <label key={p.key} className="block space-y-1">
            <span className="text-sm text-neutral-400">{p.label}</span>
            <select name={`level_${p.key}`} className={selectClass}>
              <option value="">—</option>
              <option value="EMERGING">Emerging</option>
              <option value="DEVELOPING">Developing</option>
              <option value="SKILLED">Skilled</option>
              <option value="MASTERY">Mastery</option>
            </select>
          </label>
        ))}

        <button
          type="submit"
          className="rounded bg-white text-black px-4 py-2 text-sm font-medium hover:bg-neutral-200"
        >
          Save Scores
        </button>
      </form>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Result</h2>
        {ranked.length === 0 && (
          <p className="text-neutral-500 text-sm">No scores yet for this person.</p>
        )}
        {ranked.length > 0 && (
          <div className="space-y-2 text-sm">
            {ranked.map(([key, val]) => {
              const label = PILLARS.find((p) => p.key === key)?.label;
              return (
                <div key={key} className="flex justify-between border-b border-neutral-800 pb-1">
                  <span className="text-neutral-300">{label}</span>
                  <span className="text-neutral-400">{val.toFixed(1)} / 4</span>
                </div>
              );
            })}
          </div>
        )}
        {archetype && (
          <div className="mt-4 rounded border border-neutral-700 p-5">
            <div className="text-xs uppercase text-neutral-500">Archetype</div>
            <div className="text-xl font-semibold mt-1">{archetype.name}</div>
            <p className="mt-2 text-neutral-300 text-sm">{archetype.desc}</p>
          </div>
        )}
      </section>
    </div>
  );
}

const selectClass =
  "w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm focus:outline-none focus:border-neutral-400";
