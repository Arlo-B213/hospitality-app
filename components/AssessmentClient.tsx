"use client";

import { motion } from "framer-motion";
import { Target, Star, ArrowRight, CaretDown } from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import {
  containerVariants,
  cardVariants,
  slideTopVariants,
  fieldVariants,
  pulseVariants,
  progressVariants,
} from "@/lib/animations";

interface AssessmentClientProps {
  currentUser: any;
  canViewOthers: boolean;
  outletUsers: any[];
  activeUserId: string;
  isSelf: boolean;
  pillars: { key: string; label: string }[];
  submitAction: (formData: FormData) => Promise<void>;
  ranked: [string, number][];
  archetype?: { pair: string[]; name: string; desc: string };
}

export default function AssessmentClient({
  currentUser,
  canViewOthers,
  outletUsers,
  activeUserId,
  isSelf,
  pillars,
  submitAction,
  ranked,
  archetype,
}: AssessmentClientProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const activeName = outletUsers.find((u) => u.id === activeUserId)?.name;

  return (
    <div className="space-y-16 md:space-y-24">
      {/* Premium Header */}
      <motion.div
        initial="hidden"
        animate={isLoaded ? "show" : "hidden"}
        variants={slideTopVariants}
        className="space-y-6"
      >
        <div className="flex items-start gap-6">
          <div className="p-4 rounded-3xl bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-600/20 backdrop-blur-md">
            <Target className="text-red-600 dark:text-red-500" size={32} weight="light" />
          </div>
          <div className="flex-1">
            <h1 className="text-5xl md:text-6xl font-display text-neutral-900 dark:text-white">Skills Assessment</h1>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-300 max-w-3xl leading-relaxed font-medium">
              Score behavior on the floor, not a number out of context. Self-score,
              then have the direct supervisor score independently — the gap is
              often the most useful coaching conversation in the program.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Premium User Selector */}
      {canViewOthers && (
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          method="get"
          className="max-w-md"
        >
          <label className="block space-y-4">
            <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide">
              Viewing Assessment For
            </span>
            <div className="relative">
              <select
                name="userId"
                defaultValue={activeUserId}
                className="w-full appearance-none rounded-2xl border border-micro backdrop-blur-lg bg-white/60 dark:bg-neutral-900/50 px-5 py-4 text-sm font-medium focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/20 transition-all duration-300"
              >
                {outletUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} {u.id === currentUser.id ? "(me)" : ""}
                  </option>
                ))}
              </select>
              <CaretDown
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600 dark:text-neutral-400 pointer-events-none"
                size={18}
                weight="bold"
              />
            </div>
          </label>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-6 w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold transition-all duration-300 shadow-premium hover:shadow-luxury flex items-center justify-center gap-3 uppercase tracking-wide text-sm"
          >
            <span>View Assessment</span>
            <ArrowRight size={18} weight="bold" />
          </motion.button>
        </motion.form>
      )}

      {/* Premium Assessment Form */}
      <motion.form
        action={submitAction}
        initial="hidden"
        animate={isLoaded ? "show" : "hidden"}
        variants={containerVariants}
        className="space-y-10 max-w-4xl"
      >
        <input type="hidden" name="userId" value={activeUserId} />
        <input
          type="hidden"
          name="scoredBy"
          value={isSelf ? "SELF" : "SUPERVISOR"}
        />

        {/* Premium Scoring Context */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-micro backdrop-blur-lg bg-gradient-to-r from-white/60 to-white/40 dark:from-neutral-900/50 dark:to-neutral-900/30 p-8 shadow-premium"
        >
          <p className="text-base font-medium text-neutral-700 dark:text-neutral-300">
            Scoring as{" "}
            <span className="font-bold text-neutral-900 dark:text-white bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
              {isSelf ? "Self-Assessment" : `Supervisor (${activeName})`}
            </span>
          </p>
        </motion.div>

        {/* Premium Pillar Fields */}
        <div className="space-y-8">
          {pillars.map((p, idx) => (
            <motion.div
              key={p.key}
              variants={fieldVariants}
              className="group"
              onHoverStart={() => setFocusedField(p.key)}
              onHoverEnd={() => setFocusedField(null)}
            >
              <label className="block space-y-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full transition-colors ${
                      focusedField === p.key ? "bg-red-500" : "bg-neutral-700"
                    }`}
                  />
                  <span className="text-sm font-medium text-neutral-200">
                    {p.label}
                  </span>
                </div>

                <div className="relative">
                  <select
                    name={`level_${p.key}`}
                    className="w-full appearance-none rounded-xl border border-neutral-700 bg-neutral-900/50 px-4 py-3 text-sm focus:border-red-500 focus:outline-none transition-all backdrop-blur-sm hover:border-neutral-600 cursor-pointer"
                  >
                    <option value="">Select skill level...</option>
                    <option value="EMERGING">Emerging</option>
                    <option value="DEVELOPING">Developing</option>
                    <option value="SKILLED">Skilled</option>
                    <option value="MASTERY">Mastery</option>
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"
                    size={18}
                  />
                </div>
              </label>
            </motion.div>
          ))}
        </div>

        {/* Premium Submit Button */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full px-8 py-5 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold transition-all duration-300 shadow-premium hover:shadow-luxury flex items-center justify-center gap-3 text-lg uppercase tracking-wide"
        >
          <span>Save Assessment Scores</span>
          <ArrowRight size={20} weight="bold" />
        </motion.button>
      </motion.form>

      {/* Premium Results Section */}
      {ranked.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="space-y-10"
        >
          <div className="flex items-center gap-4">
            <h2 className="text-4xl md:text-5xl font-display text-neutral-900 dark:text-white">Assessment Results</h2>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <Star className="text-red-600 dark:text-red-500" size={28} weight="duotone" />
            </motion.div>
          </div>

          {/* Premium Skill Rankings */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={containerVariants}
            className="space-y-6"
          >
            {ranked.map(([key, val], idx) => {
              const label = pillars.find((p) => p.key === key)?.label;
              const percentage = (val / 4) * 100;

              return (
                <motion.div
                  key={key}
                  variants={cardVariants}
                  className="group rounded-2xl border border-micro backdrop-blur-lg bg-white/70 dark:bg-neutral-900/50 p-8 hover:border-micro dark:hover:border-micro-dark transition-all duration-500 shadow-premium hover:shadow-luxury"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide">
                        {label}
                      </span>
                      <span className="text-2xl font-display text-red-600 dark:text-red-500">
                        {val.toFixed(1)} <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">/ 4.0</span>
                      </span>
                    </div>

                    {/* Premium Animated Progress Bar */}
                    <motion.div
                      className="w-full h-3 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden shadow-subtle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div
                        className="h-full bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-full shadow-lg shadow-red-600/40"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 40,
                          damping: 25,
                          delay: idx * 0.12 + 0.3,
                        }}
                        style={{ originX: 0 }}
                      />
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Premium Archetype Card - Luxury Highlight */}
          {archetype && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="relative overflow-hidden rounded-luxury border border-micro backdrop-blur-lg bg-gradient-to-br from-red-50/80 to-white/60 dark:from-red-950/30 dark:to-neutral-900/50 p-12 shadow-luxury hover:shadow-luxury"
            >
              {/* Premium animated background glow */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/5 to-red-600/0 opacity-0 hover:opacity-100 transition-opacity duration-500"
              />

              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate="animate"
                    variants={pulseVariants}
                    className="flex-shrink-0"
                  >
                    <Star
                      className="text-red-600 dark:text-red-500"
                      size={28}
                      weight="light"
                    />
                  </motion.div>
                  <span className="text-xs uppercase font-bold text-red-600 dark:text-red-500 tracking-widest">
                    Your Leadership Archetype
                  </span>
                </div>

                <div className="space-y-4">
                  <h3 className="text-4xl md:text-5xl font-display text-neutral-900 dark:text-white leading-tight">
                    {archetype.name}
                  </h3>
                  <p className="text-neutral-700 dark:text-neutral-200 leading-relaxed text-lg font-medium">
                    {archetype.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.section>
      )}

      {/* Premium Empty State */}
      {ranked.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <p className="text-neutral-600 dark:text-neutral-400 text-lg font-medium">
            No assessment scores yet for this person. Complete the form above to get started.
          </p>
        </motion.div>
      )}
    </div>
  );
}
