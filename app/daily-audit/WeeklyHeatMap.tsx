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

type AuditForHeatMap = {
  date: Date;
  softSkillTallies: string;
};

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function dayLabel(d: Date) {
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

export default function WeeklyHeatMap({ audits }: { audits: AuditForHeatMap[] }) {
  // Most recent 5 distinct days that have at least one audit.
  const byDay = new Map<string, { date: Date; tallies: Record<string, number> }>();
  for (const a of audits) {
    const key = dayKey(a.date);
    const parsed = JSON.parse(a.softSkillTallies || "{}") as Record<string, number>;
    const entry = byDay.get(key) ?? { date: a.date, tallies: {} };
    for (const s of SKILLS) {
      entry.tallies[s.key] = (entry.tallies[s.key] ?? 0) + (parsed[s.key] ?? 0);
    }
    byDay.set(key, entry);
  }

  const days = [...byDay.values()]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5)
    .reverse();

  if (days.length === 0) {
    return (
      <p className="text-neutral-500 text-sm">
        Not enough audits logged yet to build a weekly heat map.
      </p>
    );
  }

  const max = Math.max(
    1,
    ...days.flatMap((d) => SKILLS.map((s) => d.tallies[s.key] ?? 0))
  );

  // Identify the coldest skill overall (lowest total across the window) —
  // that's the coaching agenda for the next huddle.
  const totals = SKILLS.map((s) => ({
    key: s.key,
    label: s.label,
    total: days.reduce((sum, d) => sum + (d.tallies[s.key] ?? 0), 0),
  }));
  const coldest = totals.reduce((min, t) => (t.total < min.total ? t : min), totals[0]);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="text-sm border-collapse">
          <thead>
            <tr>
              <th className="text-left text-neutral-400 font-normal pr-4 pb-2">Skill</th>
              {days.map((d) => (
                <th
                  key={dayKey(d.date)}
                  className="text-neutral-400 font-normal px-2 pb-2 text-center min-w-20"
                >
                  {dayLabel(d.date)}
                </th>
              ))}
              <th className="text-neutral-400 font-normal px-2 pb-2 text-center">Total</th>
            </tr>
          </thead>
          <tbody>
            {SKILLS.map((s) => {
              const rowTotal = totals.find((t) => t.key === s.key)!.total;
              return (
                <tr key={s.key}>
                  <td className="pr-4 py-1 text-neutral-300 whitespace-nowrap">{s.label}</td>
                  {days.map((d) => {
                    const value = d.tallies[s.key] ?? 0;
                    const intensity = value / max;
                    return (
                      <td key={dayKey(d.date)} className="px-2 py-1">
                        <div
                          className="h-8 w-full rounded flex items-center justify-center text-xs font-medium"
                          style={{
                            backgroundColor: `rgba(34, 197, 94, ${0.08 + intensity * 0.72})`,
                            color: intensity > 0.55 ? "#052e16" : "#d4d4d4",
                          }}
                        >
                          {value > 0 ? value : ""}
                        </div>
                      </td>
                    );
                  })}
                  <td className="px-2 py-1 text-center text-neutral-400">{rowTotal}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-neutral-400">
        Coldest skill this window:{" "}
        <span className="text-neutral-200 font-medium">{coldest.label}</span> ({coldest.total}{" "}
        catches across {days.length} day{days.length === 1 ? "" : "s"}) — that&apos;s the coaching
        agenda for the next huddle.
      </p>
    </div>
  );
}
