import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/current-user";
import { createPreShiftPlan } from "./actions";

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
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">Pre-Shift Builder</h1>
        <p className="mt-2 text-neutral-400 max-w-2xl">
          Fill this out in under 2 minutes before doors open. It forces
          Focus, Clarity, Energy, and Interactive into the huddle without
          needing a script.
        </p>
        <p className="mt-2 text-sm text-neutral-500">
          Logging as <span className="text-neutral-300">{user.name}</span> ·{" "}
          {user.outlet.name}
        </p>
      </div>

      <form action={createPreShiftPlan} className="space-y-5 max-w-2xl">
        <Field label="Shift">
          <select name="shift" required className={selectClass}>
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </Field>

        <Field label="FOCUS — Tonight's ONE Big Idea">
          <input
            name="bigIdea"
            required
            list="big-idea-library"
            placeholder="e.g. Eyes up before words out."
            className={inputClass}
          />
          <datalist id="big-idea-library">
            {BIG_IDEA_LIBRARY.map((b) => (
              <option key={b.focus} value={b.idea} />
            ))}
          </datalist>
        </Field>

        <Field label={`CLARITY — "Instead of ___, do ___"`}>
          <input
            name="clearAction"
            required
            placeholder="e.g. Instead of pointing, walk the guest to the table."
            className={inputClass}
          />
        </Field>

        <Field label="ENERGY — one word for the tone needed today">
          <input name="energyWord" required className={inputClass} />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Interactive question 1">
            <input name="question1" required className={inputClass} />
          </Field>
          <Field label="Interactive question 2 (reserve for 'who had a win?')">
            <input name="question2" required className={inputClass} />
          </Field>
        </div>

        <Field label="86's / Specials (30 sec max)">
          <textarea name="eightySixes" rows={2} className={inputClass} />
        </Field>

        <button
          type="submit"
          className="rounded bg-white text-black px-4 py-2 text-sm font-medium hover:bg-neutral-200"
        >
          Save Pre-Shift Plan
        </button>
      </form>

      <section>
        <h2 className="text-lg font-medium mb-3">Recent Pre-Shifts</h2>
        <div className="space-y-3">
          {plans.length === 0 && (
            <p className="text-neutral-500 text-sm">No pre-shifts logged yet.</p>
          )}
          {plans.map((p) => (
            <div key={p.id} className="rounded border border-neutral-800 p-4 text-sm">
              <div className="flex justify-between text-neutral-400">
                <span>
                  {p.outlet.name} · {p.shift} · {p.lead.name}
                </span>
                <span>{p.date.toLocaleDateString()}</span>
              </div>
              <div className="mt-2">
                <span className="text-neutral-400">Big Idea:</span> {p.bigIdea}
              </div>
              <div className="mt-1">
                <span className="text-neutral-400">Action:</span> {p.clearAction}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const inputClass =
  "w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm focus:outline-none focus:border-neutral-400";
const selectClass = inputClass;

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-sm text-neutral-400">{label}</span>
      {children}
    </label>
  );
}
