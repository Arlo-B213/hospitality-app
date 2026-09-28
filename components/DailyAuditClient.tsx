"use client";

import { motion } from "framer-motion";
import { FileText, CheckCircle, ChartBar, ArrowRight } from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import {
  containerVariants,
  cardVariants,
  slideTopVariants,
  fieldVariants,
} from "@/lib/animations";

interface DailyAuditClientProps {
  user: any;
  skills: { key: string; label: string }[];
  submitAction: (formData: FormData) => Promise<void>;
  audits: any[];
  WeeklyHeatMap: React.ComponentType<any>;
}

const inputClass =
  "w-full rounded-lg border border-neutral-700 bg-neutral-900/50 px-4 py-3 text-sm focus:border-red-500 focus:outline-none transition-colors backdrop-blur-sm hover:border-neutral-600";
const selectClass = inputClass;

export default function DailyAuditClient({
  user,
  skills,
  submitAction,
  audits,
  WeeklyHeatMap,
}: DailyAuditClientProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string>("shift");

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="space-y-12 md:space-y-16">
      {/* Header */}
      <motion.div
        initial="hidden"
        animate={isLoaded ? "show" : "hidden"}
        variants={slideTopVariants}
        className="space-y-6"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-700/50">
            <FileText className="text-green-400" size={28} weight="duotone" />
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-bold">Daily Per-Shift Audit</h1>
            <p className="mt-2 text-neutral-400 max-w-3xl leading-relaxed">
              Filled out by the shift lead at close. Under 5 minutes. Track
              transaction standards, ticket times, soft-skill execution, and
              coaching moments.
            </p>
            <p className="mt-4 text-sm text-neutral-400">
              Logging as{" "}
              <span className="font-medium text-neutral-200">{user.name}</span> ·{" "}
              <span className="font-medium text-neutral-200">{user.outlet.name}</span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Form */}
      <motion.form
        action={submitAction}
        initial="hidden"
        animate={isLoaded ? "show" : "hidden"}
        variants={containerVariants}
        className="space-y-6 max-w-4xl"
      >
        {/* Shift Selection */}
        <motion.div variants={fieldVariants}>
          <label className="block space-y-3">
            <span className="text-sm font-medium text-neutral-200">Shift</span>
            <select name="shift" required className={selectClass}>
              <option value="AM">AM Shift</option>
              <option value="PM">PM Shift</option>
            </select>
          </label>
        </motion.div>

        {/* Transaction Standards Section */}
        <FormSection
          title="Transaction Standards"
          icon={CheckCircle}
          id="transactions"
          expanded={expandedSection === "transactions"}
          onToggle={() =>
            setExpandedSection(
              expandedSection === "transactions" ? "" : "transactions"
            )
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Total transactions observed">
              <input
                type="number"
                name="transactionsObserved"
                className={inputClass}
              />
            </FormField>
            <FormField label="Genuine opener delivered">
              <select name="openerStatus" className={selectClass}>
                <option value="">— Select —</option>
                <option value="YES">Yes</option>
                <option value="MOSTLY">Mostly</option>
                <option value="MISSED">Missed</option>
              </select>
            </FormField>
            <FormField label="Opener miss count">
              <input
                type="number"
                name="openerMissCount"
                className={inputClass}
              />
            </FormField>
            <FormField label="Personalized close delivered">
              <select name="closeStatus" className={selectClass}>
                <option value="">— Select —</option>
                <option value="YES">Yes</option>
                <option value="MOSTLY">Mostly</option>
                <option value="MISSED">Missed</option>
              </select>
            </FormField>
            <FormField label="Close miss count">
              <input type="number" name="closeMissCount" className={inputClass} />
            </FormField>
            <FormField label="Order accuracy — correct">
              <input
                type="number"
                name="orderAccuracyCorrect"
                className={inputClass}
              />
            </FormField>
            <FormField label="Order accuracy — total spot-checked">
              <input
                type="number"
                name="orderAccuracyTotal"
                className={inputClass}
              />
            </FormField>
          </div>
        </FormSection>

        {/* Ticket Time Tracking Section */}
        <FormSection
          title="Ticket Time Tracking"
          icon={BarChart3}
          id="tickets"
          expanded={expandedSection === "tickets"}
          onToggle={() =>
            setExpandedSection(expandedSection === "tickets" ? "" : "tickets")
          }
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Avg ticket time (seconds)">
                <input
                  type="number"
                  name="avgTicketTimeSeconds"
                  className={inputClass}
                />
              </FormField>
              <FormField label="Standard (seconds)">
                <input
                  type="number"
                  name="ticketTimeStandard"
                  className={inputClass}
                />
              </FormField>
              <FormField label="Peak-hour ticket time high (seconds)">
                <input
                  type="number"
                  name="peakTicketTimeSeconds"
                  className={inputClass}
                />
              </FormField>
              <FormField label="Cause if over">
                <input name="peakCause" className={inputClass} />
              </FormField>
            </div>
            <FormField label="86'd items today">
              <textarea
                name="eightySixedItems"
                rows={3}
                className={inputClass}
                placeholder="List any items that were unavailable..."
              />
            </FormField>
          </div>
        </FormSection>

        {/* Soft Skills Section */}
        <FormSection
          title="Soft Skill Execution — Spot Check Tally"
          icon={FileText}
          id="skills"
          expanded={expandedSection === "skills"}
          onToggle={() =>
            setExpandedSection(expandedSection === "skills" ? "" : "skills")
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {skills.map((s, idx) => (
              <motion.div
                key={s.key}
                variants={fieldVariants}
                custom={idx}
                transition={{ delay: idx * 0.05 }}
              >
                <FormField label={s.label}>
                  <input
                    type="number"
                    name={`tally_${s.key}`}
                    defaultValue={0}
                    min={0}
                    className={inputClass}
                  />
                </FormField>
              </motion.div>
            ))}
          </div>
        </FormSection>

        {/* Coaching Section */}
        <FormSection
          title="Moment of the Shift / Coaching Needed"
          icon={FileText}
          id="coaching"
          expanded={expandedSection === "coaching"}
          onToggle={() =>
            setExpandedSection(expandedSection === "coaching" ? "" : "coaching")
          }
        >
          <div className="space-y-6">
            <FormField label="Moment of the shift (one specific win, named + quoted)">
              <textarea
                name="momentOfShift"
                rows={3}
                className={inputClass}
                placeholder="Describe a positive moment from this shift..."
              />
            </FormField>
            <FormField label="Coaching needed (one specific miss)">
              <textarea
                name="coachingNeeded"
                rows={3}
                className={inputClass}
                placeholder="Identify one area for improvement..."
              />
            </FormField>
          </div>
        </FormSection>

        {/* Non-Negotiables Section */}
        <FormSection
          title="Non-Negotiables Check"
          icon={CheckCircle}
          id="nonneg"
          expanded={expandedSection === "nonneg"}
          onToggle={() =>
            setExpandedSection(expandedSection === "nonneg" ? "" : "nonneg")
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField label="#1 The First Look">
              <select name="nonNeg1Status" className={selectClass}>
                <option value="">— Select —</option>
                <option value="YES">Yes</option>
                <option value="MOSTLY">Partial</option>
                <option value="MISSED">No</option>
              </select>
            </FormField>
            <FormField label="#2 Own It, Don't Toss It">
              <select name="nonNeg2Status" className={selectClass}>
                <option value="">— Select —</option>
                <option value="YES">Yes</option>
                <option value="MOSTLY">Partial</option>
                <option value="MISSED">No</option>
              </select>
            </FormField>
            <FormField label="#3 The Send-Off With Substance">
              <select name="nonNeg3Status" className={selectClass}>
                <option value="">— Select —</option>
                <option value="YES">Yes</option>
                <option value="MOSTLY">Partial</option>
                <option value="MISSED">No</option>
              </select>
            </FormField>
          </div>
        </FormSection>

        {/* Submit Button */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold transition-all flex items-center justify-center gap-2 text-lg"
        >
          <span>Save Audit</span>
          <ArrowRight size={20} weight="bold" />
        </motion.button>
      </motion.form>

      {/* Weekly Heat Map */}
      {audits.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20">
              <ChartBar className="text-blue-400" size={24} weight="duotone" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Weekly Soft-Skill Heat Map</h2>
              <p className="text-sm text-neutral-400 mt-1">
                Five most recent logged days — an instant read on which soft
                skill is trending.
              </p>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <WeeklyHeatMap audits={audits} />
          </motion.div>
        </motion.section>
      )}

      {/* Recent Audits */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-6"
      >
        <h2 className="text-2xl font-bold">Recent Audits</h2>
        <motion.div
          initial="hidden"
          animate="show"
          variants={containerVariants}
          className="grid gap-4"
        >
          {audits.length === 0 && (
            <p className="text-neutral-500 text-center py-12">
              No audits logged yet. Start by completing the form above.
            </p>
          )}
          {audits.map((a, idx) => {
            const tallies = JSON.parse(a.softSkillTallies || "{}") as Record<
              string,
              number
            >;
            const topSkill = Object.entries(tallies).sort(
              (x, y) => y[1] - x[1]
            )[0];
            return (
              <motion.div
                key={a.id}
                variants={cardVariants}
                className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 backdrop-blur-sm hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-medium text-neutral-100">
                      {a.outlet.name} · <span className="text-red-400 font-bold">{a.shift}</span> · {a.lead.name}
                    </p>
                    <p className="text-sm text-neutral-400 mt-1">
                      {a.date.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-neutral-300">
                  <p>
                    📊 Order accuracy:{" "}
                    <span className="text-red-400 font-medium">
                      {a.orderAccuracyCorrect}/{a.orderAccuracyTotal}
                    </span>
                  </p>
                  <p>
                    ⏱️ Avg ticket time:{" "}
                    <span className="text-red-400 font-medium">
                      {a.avgTicketTimeSeconds ?? "—"}s
                    </span>
                  </p>
                  {topSkill && Number(topSkill[1]) > 0 && (
                    <p>
                      🎯 Top skill:{" "}
                      <span className="text-red-400 font-medium">
                        {topSkill[0]} ({topSkill[1]})
                      </span>
                    </p>
                  )}
                  {a.momentOfShift && (
                    <p className="italic text-neutral-400">
                      ✨ {a.momentOfShift}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.section>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <motion.label variants={fieldVariants} className="block space-y-2">
      <span className="text-sm font-medium text-neutral-200">{label}</span>
      {children}
    </motion.label>
  );
}

function FormSection({
  title,
  icon: Icon,
  id,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  icon: React.ComponentType<any>;
  id: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      variants={cardVariants}
      className="rounded-xl border border-neutral-800 bg-neutral-900/50 backdrop-blur-sm overflow-hidden"
    >
      <motion.button
        type="button"
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center gap-3 hover:bg-neutral-800/50 transition-colors"
      >
        <div className="p-2 rounded-lg bg-gradient-to-br from-red-500/20 to-red-600/20">
          <Icon className="text-red-400" size={20} weight="duotone" />
        </div>
        <h3 className="text-base font-semibold text-neutral-100 flex-1 text-left">
          {title}
        </h3>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg
            className="w-5 h-5 text-neutral-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </motion.div>
      </motion.button>

      <motion.div
        initial={false}
        animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className="px-6 py-6 border-t border-neutral-800 space-y-6">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}
