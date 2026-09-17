import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/current-user";
import { createDailyAudit } from "./actions";
import WeeklyHeatMap from "./WeeklyHeatMap";

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
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">
          Daily Per-Shift Audit &amp; Hospitality Recap Log
        </h1>
        <p className="mt-2 text-neutral-400 max-w-2xl">
          Filled out by the shift lead at close. Under 5 minutes.
        </p>
        <p className="mt-2 text-sm text-neutral-500">
          Logging as <span className="text-neutral-300">{user.name}</span> ·{" "}
          {user.outlet.name}
        </p>
      </div>

      <form action={createDailyAudit} className="space-y-8 max-w-2xl">
        <Field label="Shift">
          <select name="shift" required className={selectClass}>
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </Field>

        <Section title="Transaction Standards">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Total transactions observed">
              <input type="number" name="transactionsObserved" className={inputClass} />
            </Field>
            <div />
            <Field label="Genuine opener delivered">
              <select name="openerStatus" className={selectClass}>
                <option value="">—</option>
                <option value="YES">Yes</option>
                <option value="MOSTLY">Mostly</option>
                <option value="MISSED">Missed</option>
              </select>
            </Field>
            <Field label="Opener miss count">
              <input type="number" name="openerMissCount" className={inputClass} />
            </Field>
            <Field label="Personalized close delivered">
              <select name="closeStatus" className={selectClass}>
                <option value="">—</option>
                <option value="YES">Yes</option>
                <option value="MOSTLY">Mostly</option>
                <option value="MISSED">Missed</option>
              </select>
            </Field>
            <Field label="Close miss count">
              <input type="number" name="closeMissCount" className={inputClass} />
            </Field>
            <Field label="Order accuracy — correct">
              <input type="number" name="orderAccuracyCorrect" className={inputClass} />
            </Field>
            <Field label="Order accuracy — total spot-checked">
              <input type="number" name="orderAccuracyTotal" className={inputClass} />
            </Field>
          </div>
        </Section>

        <Section title="Ticket Time Tracking">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Avg ticket time (seconds)">
              <input type="number" name="avgTicketTimeSeconds" className={inputClass} />
            </Field>
            <Field label="Standard (seconds)">
              <input type="number" name="ticketTimeStandard" className={inputClass} />
            </Field>
            <Field label="Peak-hour ticket time high (seconds)">
              <input type="number" name="peakTicketTimeSeconds" className={inputClass} />
            </Field>
            <Field label="Cause if over">
              <input name="peakCause" className={inputClass} />
            </Field>
          </div>
          <Field label="86'd items today">
            <textarea name="eightySixedItems" rows={2} className={inputClass} />
          </Field>
        </Section>

        <Section title="Soft Skill Execution — Spot Check Tally">
          <div className="grid grid-cols-2 gap-4">
            {SKILLS.map((s) => (
              <Field key={s.key} label={s.label}>
                <input
                  type="number"
                  name={`tally_${s.key}`}
                  defaultValue={0}
                  min={0}
                  className={inputClass}
                />
              </Field>
            ))}
          </div>
        </Section>

        <Section title="Moment of the Shift / Coaching Needed">
          <Field label="Moment of the shift (one specific win, named + quoted)">
            <textarea name="momentOfShift" rows={2} className={inputClass} />
          </Field>
          <Field label="Coaching needed (one specific miss)">
            <textarea name="coachingNeeded" rows={2} className={inputClass} />
          </Field>
        </Section>

        <Section title="Non-Negotiables Check">
          <div className="grid grid-cols-3 gap-4">
            <Field label="#1 The First Look">
              <select name="nonNeg1Status" className={selectClass}>
                <option value="">—</option>
                <option value="YES">Yes</option>
                <option value="MOSTLY">Partial</option>
                <option value="MISSED">No</option>
              </select>
            </Field>
            <Field label="#2 Own It, Don't Toss It">
              <select name="nonNeg2Status" className={selectClass}>
                <option value="">—</option>
                <option value="YES">Yes</option>
                <option value="MOSTLY">Partial</option>
                <option value="MISSED">No</option>
              </select>
            </Field>
            <Field label="#3 The Send-Off With Substance">
              <select name="nonNeg3Status" className={selectClass}>
                <option value="">—</option>
                <option value="YES">Yes</option>
                <option value="MOSTLY">Partial</option>
                <option value="MISSED">No</option>
              </select>
            </Field>
          </div>
        </Section>

        <button
          type="submit"
          className="rounded bg-white text-black px-4 py-2 text-sm font-medium hover:bg-neutral-200"
        >
          Save Audit
        </button>
      </form>

      <section>
        <h2 className="text-lg font-medium mb-1">Weekly Soft-Skill Heat Map</h2>
        <p className="text-sm text-neutral-500 mb-4">
          Five most recent logged days, stacked side by side — an instant read
          on which soft skill is slipping.
        </p>
        <WeeklyHeatMap audits={audits} />
      </section>

      <section>
        <h2 className="text-lg font-medium mb-3">Recent Audits</h2>
        <div className="space-y-3">
          {audits.length === 0 && (
            <p className="text-neutral-500 text-sm">No audits logged yet.</p>
          )}
          {audits.map((a) => {
            const tallies = JSON.parse(a.softSkillTallies || "{}") as Record<
              string,
              number
            >;
            const topSkill = Object.entries(tallies).sort(
              (x, y) => y[1] - x[1]
            )[0];
            return (
              <div key={a.id} className="rounded border border-neutral-800 p-4 text-sm">
                <div className="flex justify-between text-neutral-400">
                  <span>
                    {a.outlet.name} · {a.shift} · {a.lead.name}
                  </span>
                  <span>{a.date.toLocaleDateString()}</span>
                </div>
                <div className="mt-2 text-neutral-300">
                  Order accuracy: {a.orderAccuracyCorrect}/{a.orderAccuracyTotal} ·
                  {" "}Avg ticket: {a.avgTicketTimeSeconds ?? "—"}s
                </div>
                {topSkill && Number(topSkill[1]) > 0 && (
                  <div className="mt-1 text-neutral-300">
                    Most-caught skill this shift: {topSkill[0]} ({String(topSkill[1])})
                  </div>
                )}
                {a.momentOfShift && (
                  <div className="mt-1 text-neutral-300">
                    Moment: {a.momentOfShift}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

const inputClass =
  "w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm focus:outline-none focus:border-neutral-400";
const selectClass = inputClass;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm text-neutral-400">{label}</span>
      {children}
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-neutral-300 border-b border-neutral-800 pb-1">
        {title}
      </h3>
      {children}
    </div>
  );
}
