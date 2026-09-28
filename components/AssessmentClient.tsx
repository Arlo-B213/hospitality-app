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
    <div className="space-y-12">
      {/* Header */}
      <motion.div
        initial="hidden"
        animate={isLoaded ? "show" : "hidden"}
        variants={slideTopVariants}
        className="space-y-4"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-700/50">
            <Target className="text-red-400" size={28} weight="duotone" />
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-bold">Skills Assessment</h1>
            <p className="mt-2 text-neutral-400 max-w-3xl leading-relaxed">
              Score behavior on the floor, not a number out of context. Self-score,
              then have the direct supervisor score independently — the gap is
              often the most useful coaching conversation in the program.
            </p>
          </div>
        </div>
      </motion.div>

      {/* User Selector */}
      {canViewOthers && (
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          method="get"
          className="max-w-md"
        >
          <label className="block space-y-3">
            <span className="text-sm font-medium text-neutral-300">
              Viewing Assessment For
            </span>
            <div className="relative">
              <select
                name="userId"
                defaultValue={activeUserId}
                className="w-full appearance-none rounded-xl border border-neutral-700 bg-neutral-900/50 px-4 py-3 text-sm focus:border-red-500 focus:outline-none transition-colors backdrop-blur-sm"
              >
                {outletUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} {u.id === currentUser.id ? "(me)" : ""}
                  </option>
                ))}
              </select>
              <CaretDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"
                size={18}
              />
            </div>
          </label>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-4 w-full px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-colors flex items-center justify-center gap-2"
          >
            <span>View Assessment</span>
            <ArrowRight size={18} weight="bold" />
          </motion.button>
        </motion.form>
      )}

      {/* Assessment Form */}
      <motion.form
        action={submitAction}
        initial="hidden"
        animate={isLoaded ? "show" : "hidden"}
        variants={containerVariants}
        className="space-y-8 max-w-3xl"
      >
        <input type="hidden" name="userId" value={activeUserId} />
        <input
          type="hidden"
          name="scoredBy"
          value={isSelf ? "SELF" : "SUPERVISOR"}
        />

        {/* Scoring Context */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-neutral-700 bg-neutral-900/50 p-6 backdrop-blur-sm"
        >
          <p className="text-sm text-neutral-400">
            Scoring as{" "}
            <span className="font-medium text-neutral-200">
              {isSelf ? "Self-Assessment" : `Supervisor (${activeName})`}
            </span>
          </p>
        </motion.div>

        {/* Pillar Fields */}
        <div className="space-y-6">
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

        {/* Submit Button */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold transition-all flex items-center justify-center gap-2 text-lg"
        >
          <span>Save Assessment Scores</span>
          <ArrowRight size={20} weight="bold" />
        </motion.button>
      </motion.form>

      {/* Results Section */}
      {ranked.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-8"
        >
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">Assessment Results</h2>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Star className="text-red-500" size={24} weight="duotone" />
            </motion.div>
          </div>

          {/* Skill Rankings */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={containerVariants}
            className="space-y-4"
          >
            {ranked.map(([key, val], idx) => {
              const label = pillars.find((p) => p.key === key)?.label;
              const percentage = (val / 4) * 100;

              return (
                <motion.div
                  key={key}
                  variants={cardVariants}
                  className="group rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 hover:border-neutral-700 transition-colors backdrop-blur-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-neutral-300">
                        {label}
                      </span>
                      <span className="text-lg font-bold text-red-400">
                        {val.toFixed(1)} / 4.0
                      </span>
                    </div>

                    {/* Animated Progress Bar */}
                    <motion.div
                      className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div
                        className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 50,
                          damping: 20,
                          delay: idx * 0.1 + 0.2,
                        }}
                        style={{ originX: 0 }}
                      />
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Archetype Card */}
          {archetype && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="relative overflow-hidden rounded-2xl border border-red-700/50 bg-gradient-to-br from-red-950/40 to-red-900/20 p-8 backdrop-blur-sm"
            >
              {/* Animated background */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                animate={{
                  backgroundPosition: ["200% center", "-200% center"],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />

              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate="animate"
                    variants={pulseVariants}
                    className="flex-shrink-0"
                  >
                    <Star
                      className="text-red-400"
                      size={24}
                      weight="duotone"
                    />
                  </motion.div>
                  <span className="text-xs uppercase font-bold text-red-300">
                    Your Leadership Archetype
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-3xl font-bold text-white">
                    {archetype.name}
                  </h3>
                  <p className="text-neutral-200 leading-relaxed text-lg">
                    {archetype.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.section>
      )}

      {/* Empty State */}
      {ranked.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-neutral-500 text-lg">
            No assessment scores yet for this person. Complete the form above to get started.
          </p>
        </motion.div>
      )}
    </div>
  );
}
