import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/current-user";
import { submitQuizAnswer } from "./actions";
import type { OutletTier } from "@prisma/client";

const TIER_LABEL: Record<OutletTier, string> = {
  QSR: "QSR / Food Court",
  CASUAL: "Casual Dining",
  FINE_DINING: "Fine Dining",
};

export default async function QuizPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string; module?: string }>;
}) {
  const user = await requireCurrentUser();
  const { tier, module: moduleParam } = await searchParams;

  const tierFilter = (tier as OutletTier | "ALL") || user.outlet.tier;
  const moduleFilter = moduleParam && moduleParam !== "ALL" ? Number(moduleParam) : undefined;

  const scenarios = await prisma.quizScenario.findMany({
    where: {
      tier: tierFilter === "ALL" ? undefined : tierFilter,
      moduleNumber: moduleFilter,
    },
    orderBy: [{ moduleNumber: "asc" }, { tier: "asc" }],
    include: {
      attempts: {
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  const answeredCount = scenarios.filter((s) => s.attempts.length > 0).length;
  const correctCount = scenarios.filter((s) => s.attempts[0]?.correct).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Situational Quiz</h1>
        <p className="mt-2 text-neutral-400 max-w-2xl">
          Floor-real scenarios, filtered to your outlet&apos;s service tier by
          default. Pick the best-practice answer, then see the coaching note
          regardless of what you chose.
        </p>
        <p className="mt-2 text-sm text-neutral-500">
          Answering as <span className="text-neutral-300">{user.name}</span> ·{" "}
          {answeredCount}/{scenarios.length} answered · {correctCount} correct
        </p>
      </div>

      <form method="get" className="flex flex-wrap items-end gap-3">
        <label className="block space-y-1">
          <span className="text-sm text-neutral-400">Tier</span>
          <select name="tier" defaultValue={tierFilter} className={selectClass}>
            <option value={user.outlet.tier}>
              My outlet ({TIER_LABEL[user.outlet.tier]})
            </option>
            <option value="QSR">QSR / Food Court</option>
            <option value="CASUAL">Casual Dining</option>
            <option value="FINE_DINING">Fine Dining</option>
            <option value="ALL">All tiers</option>
          </select>
        </label>
        <label className="block space-y-1">
          <span className="text-sm text-neutral-400">Module</span>
          <select name="module" defaultValue={moduleParam || "ALL"} className={selectClass}>
            <option value="ALL">All modules</option>
            <option value="1">1 — The Guest Read</option>
            <option value="2">2 — The Recovery Play</option>
            <option value="3">3 — The Handoff</option>
            <option value="4">4 — The Message</option>
          </select>
        </label>
        <button
          type="submit"
          className="rounded border border-neutral-700 px-3 py-2 text-sm hover:border-neutral-500"
        >
          Apply
        </button>
      </form>

      <div className="space-y-6">
        {scenarios.length === 0 && (
          <p className="text-neutral-500 text-sm">No scenarios match this filter.</p>
        )}
        {scenarios.map((s) => {
          const lastAttempt = s.attempts[0];
          return (
            <div key={s.id} className="rounded border border-neutral-800 p-5">
              <div className="text-xs uppercase text-neutral-500 mb-2">
                Module {s.moduleNumber} · {TIER_LABEL[s.tier]} · {s.skillTested}
              </div>
              <p className="text-sm mb-4">{s.situation}</p>

              <form action={submitQuizAnswer} className="space-y-2">
                <input type="hidden" name="scenarioId" value={s.id} />
                {(["A", "B", "C", "D"] as const).map((letter) => (
                  <label
                    key={letter}
                    className="flex gap-2 items-start text-sm cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="chosenAnswer"
                      value={letter}
                      required
                      className="mt-1"
                    />
                    <span>
                      <strong>{letter})</strong>{" "}
                      {letter === "A" && s.optionA}
                      {letter === "B" && s.optionB}
                      {letter === "C" && s.optionC}
                      {letter === "D" && s.optionD}
                    </span>
                  </label>
                ))}
                <button
                  type="submit"
                  className="mt-2 rounded bg-white text-black px-3 py-1.5 text-sm font-medium hover:bg-neutral-200"
                >
                  Submit Answer
                </button>
              </form>

              {lastAttempt && (
                <div
                  className={`mt-4 rounded p-3 text-sm ${
                    lastAttempt.correct
                      ? "border border-green-800 bg-green-950/40"
                      : "border border-amber-800 bg-amber-950/40"
                  }`}
                >
                  <div className="font-medium mb-1">
                    Last answer: {lastAttempt.chosenAnswer} —{" "}
                    {lastAttempt.correct ? "Correct" : "Not quite"}
                  </div>
                  <p className="text-neutral-300">{s.coachingNote}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const selectClass =
  "rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm min-w-48";
