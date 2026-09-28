"use client";

import { motion } from "framer-motion";
import {
  Lightning,
  FolderOpen,
  CheckCircle,
  ArrowRight,
  Flame,
} from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import {
  containerVariants,
  cardVariants,
  slideTopVariants,
  fieldVariants,
  pulseVariants,
} from "@/lib/animations";

interface PreShiftClientProps {
  user: any;
  plans: any[];
  bigIdeaLibrary: { focus: string; idea: string; action: string }[];
  submitAction: (formData: FormData) => Promise<void>;
}

const inputClass =
  "w-full rounded-lg border border-neutral-700 bg-neutral-900/50 px-4 py-3 text-sm focus:border-red-500 focus:outline-none transition-colors backdrop-blur-sm hover:border-neutral-600";
const selectClass = inputClass;

export default function PreShiftClient({
  user,
  plans,
  bigIdeaLibrary,
  submitAction,
}: PreShiftClientProps) {
  const [isLoaded, setIsLoaded] = useState(false);

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
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-700/50">
            <Lightning className="text-blue-400" size={28} weight="duotone" />
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-bold">Pre-Shift Builder</h1>
            <p className="mt-2 text-neutral-400 max-w-3xl leading-relaxed">
              Fill this out in under 2 minutes before doors open. It forces
              Focus, Clarity, Energy, and Interactive into the huddle without
              needing a script.
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
        className="space-y-8 max-w-3xl"
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

        {/* FOCUS Section */}
        <FormCard icon={Flame} title="FOCUS — Tonight's ONE Big Idea" delay={0.1}>
          <motion.div variants={fieldVariants} className="space-y-3">
            <input
              name="bigIdea"
              required
              list="big-idea-library"
              placeholder="e.g. Eyes up before words out."
              className={inputClass}
            />
            <datalist id="big-idea-library">
              {bigIdeaLibrary.map((b) => (
                <option key={b.focus} value={b.idea} />
              ))}
            </datalist>
            <div className="text-xs text-neutral-400 space-y-2">
              {bigIdeaLibrary.map((b) => (
                <div key={b.focus} className="flex items-start gap-2">
                  <span className="font-medium text-red-400">{b.focus}:</span>
                  <span>{b.idea}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </FormCard>

        {/* CLARITY Section */}
        <FormCard
          icon={CheckCircle}
          title="CLARITY — Instead of ___, do ___"
          delay={0.2}
        >
          <motion.div variants={fieldVariants}>
            <input
              name="clearAction"
              required
              placeholder="e.g. Instead of pointing, walk the guest to the table."
              className={inputClass}
            />
          </motion.div>
        </FormCard>

        {/* ENERGY Section */}
        <FormCard icon={Lightning} title="ENERGY — One Word for Today's Tone" delay={0.3}>
          <motion.div variants={fieldVariants}>
            <input
              name="energyWord"
              required
              placeholder="e.g. Calm, Energetic, Focused..."
              className={inputClass}
            />
          </motion.div>
        </FormCard>

        {/* INTERACTIVE Section */}
        <FormCard
          icon={FolderOpen}
          title="INTERACTIVE — Two Questions"
          delay={0.4}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div variants={fieldVariants} className="space-y-2">
              <label className="block text-sm font-medium text-neutral-200">
                Question 1
              </label>
              <input
                name="question1"
                required
                placeholder="Engaging question for the team"
                className={inputClass}
              />
            </motion.div>
            <motion.div
              variants={fieldVariants}
              custom={1}
              className="space-y-2"
            >
              <label className="block text-sm font-medium text-neutral-200">
                Question 2 (Reserve for wins)
              </label>
              <input
                name="question2"
                required
                placeholder="e.g. Who had a win today?"
                className={inputClass}
              />
            </motion.div>
          </div>
        </FormCard>

        {/* 86's Section */}
        <FormCard icon={CheckCircle} title="86's & Specials (30 sec max)" delay={0.5}>
          <motion.div variants={fieldVariants}>
            <textarea
              name="eightySixes"
              rows={3}
              placeholder="List any items 86'd or specials for today..."
              className={inputClass}
            />
          </motion.div>
        </FormCard>

        {/* Submit Button */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold transition-all flex items-center justify-center gap-2 text-lg"
        >
          <span>Save Pre-Shift Plan</span>
          <ArrowRight size={20} weight="bold" />
        </motion.button>
      </motion.form>

      {/* Recent Pre-Shifts */}
      {plans.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold">Recent Pre-Shifts</h2>
          <motion.div
            initial="hidden"
            animate="show"
            variants={containerVariants}
            className="grid gap-4"
          >
            {plans.map((p, idx) => (
              <motion.div
                key={p.id}
                variants={cardVariants}
                className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 backdrop-blur-sm hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-medium text-neutral-100">
                      {p.outlet.name} ·{" "}
                      <span className="text-blue-400 font-bold">{p.shift}</span> ·{" "}
                      {p.lead.name}
                    </p>
                    <p className="text-sm text-neutral-400 mt-1">
                      {p.date.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="space-y-3 text-sm text-neutral-300">
                  <div className="flex items-start gap-2">
                    <Flame className="text-red-400 flex-shrink-0 mt-0.5" size={16} />
                    <div>
                      <p className="text-neutral-400 text-xs font-medium">FOCUS</p>
                      <p>{p.bigIdea}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle
                      className="text-green-400 flex-shrink-0 mt-0.5"
                      size={16}
                    />
                    <div>
                      <p className="text-neutral-400 text-xs font-medium">ACTION</p>
                      <p>{p.clearAction}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Lightning className="text-blue-400 flex-shrink-0 mt-0.5" size={16} />
                    <div>
                      <p className="text-neutral-400 text-xs font-medium">ENERGY</p>
                      <p>{p.energyWord}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>
      )}

      {/* Empty State */}
      {plans.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-neutral-500 text-lg">
            No pre-shifts logged yet. Create one above to get started!
          </p>
        </motion.div>
      )}
    </div>
  );
}

function FormCard({
  icon: Icon,
  title,
  children,
  delay,
}: {
  icon: React.ComponentType<any>;
  title: string;
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <motion.div variants={cardVariants} custom={delay}>
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 backdrop-blur-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center gap-3 bg-neutral-900/30">
          <div className="p-2 rounded-lg bg-gradient-to-br from-red-500/20 to-red-600/20">
            <Icon className="text-red-400" size={20} weight="duotone" />
          </div>
          <h3 className="text-base font-semibold text-neutral-100">{title}</h3>
        </div>
        <div className="px-6 py-6 space-y-4">{children}</div>
      </div>
    </motion.div>
  );
}
