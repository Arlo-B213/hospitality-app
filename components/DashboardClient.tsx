"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ClipboardText,
  CheckCircle,
  BookOpen,
  Target,
  Users,
  FileText,
  Lightning,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import {
  containerVariants,
  cardVariants,
  slideTopVariants,
  pulseVariants,
  floatVariants,
  glowVariants,
  buttonHoverVariants,
  driftVariants,
} from "@/lib/animations";

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Zap: Lightning,
  FileText,
  BookOpen,
  Target,
  Users,
  ClipboardText,
  CheckCircle,
};

interface Module {
  href: string;
  title: string;
  desc: string;
  icon: string;
  color: string;
}

interface DashboardClientProps {
  user: any;
  userCount: number;
  auditCount: number;
  preShiftCount: number;
  modules: Module[];
}

export default function DashboardClient({
  user,
  userCount,
  auditCount,
  preShiftCount,
  modules,
}: DashboardClientProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="space-y-16 md:space-y-24">
      {/* Premium Header Section */}
      <motion.div
        initial="hidden"
        animate={isLoaded ? "show" : "hidden"}
        variants={slideTopVariants}
        className="space-y-8"
      >
        <div className="space-y-6">
          <h1 className="text-5xl md:text-6xl font-display text-neutral-900 dark:text-white tracking-tight leading-tight">
            A Complete Hospitality Leadership & Soft Skills Development System
          </h1>
          <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-300 max-w-4xl leading-relaxed font-medium">
            Build the system once, make it repeatable, then trust your people
            to run it. Five pillars, four floor modules, one operating system
            for how leaders think under pressure.
          </p>
          <div className="flex items-center gap-4 pt-6">
            <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide">
              {user.outlet.name}
            </span>
            <span className="h-2 w-2 rounded-full bg-red-600 shadow-lg shadow-red-600/40"></span>
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">
              {user.outlet.tier.replace("_", " ")}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Premium Stats Grid - Luxury Depth */}
      <motion.div
        initial="hidden"
        animate={isLoaded ? "show" : "hidden"}
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12"
      >
        <StatCard
          label="Team Members"
          value={userCount}
          icon={Users}
          index={0}
        />
        <StatCard
          label="Daily Audits Logged"
          value={auditCount}
          icon={CheckCircle}
          index={1}
        />
        <StatCard
          label="Pre-Shifts Logged"
          value={preShiftCount}
          icon={ClipboardText}
          index={2}
        />
      </motion.div>

      {/* Premium Module Cards - Ultra-Generous Spacing */}
      <motion.div
        initial="hidden"
        animate={isLoaded ? "show" : "hidden"}
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14"
      >
        {modules.map((m, idx) => (
          <ModuleCard
            key={m.href}
            module={m}
            icon={ICON_MAP[m.icon]}
            index={idx}
          />
        ))}
      </motion.div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  index,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<any>;
  index: number;
}) {
  return (
    <motion.div variants={cardVariants} className="h-full">
      <motion.div
        whileHover="hover"
        initial="rest"
        variants={glowVariants}
        className="group relative h-full overflow-hidden rounded-luxury border border-micro backdrop-blur-lg bg-white/80 dark:bg-neutral-900/70 p-12 lg:p-14 transition-all shadow-premium hover:shadow-luxury"
      >
        {/* Premium animated background gradient - subtle */}
        <motion.div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Content */}
        <div className="relative z-10 space-y-6">
          <motion.div
            animate="animate"
            variants={driftVariants}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500/15 to-red-600/10 border border-red-600/10 flex items-center justify-center"
          >
            <Icon className="text-red-600 dark:text-red-500" size={28} weight="light" />
          </motion.div>

          <div className="space-y-3">
            <motion.div
              className="text-5xl md:text-6xl font-display text-neutral-900 dark:text-white"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.12, duration: 0.7, ease: [0.32, 0.72, 0.3, 1] }}
            >
              {value}
            </motion.div>
            <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">{label}</p>
          </div>
        </div>

        {/* Premium bottom accent - refined gradient bar */}
        <motion.div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-red-500/40 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
      </motion.div>
    </motion.div>
  );
}

function ModuleCard({
  module,
  icon: Icon,
  index,
}: {
  module: Module;
  icon: React.ComponentType<any>;
  index: number;
}) {
  return (
    <motion.div variants={cardVariants}>
      <Link href={module.href} className="block h-full">
        <motion.div
          whileHover="hover"
          initial="rest"
          variants={buttonHoverVariants}
          className="group relative overflow-hidden rounded-luxury border border-micro backdrop-blur-lg bg-white/75 dark:bg-neutral-900/60 p-10 lg:p-14 transition-all cursor-pointer h-full flex flex-col justify-between shadow-premium hover:shadow-luxury"
        >
          {/* Premium animated gradient background */}
          <motion.div
            className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
          />

          {/* Icon with refined float animation */}
          <motion.div
            animate="animate"
            variants={floatVariants}
            className="relative z-10 mb-8"
          >
            <div
              className={`w-18 h-18 rounded-3xl bg-gradient-to-br ${module.color} border border-white/20 dark:border-neutral-700/50 flex items-center justify-center group-hover:border-white/40 dark:group-hover:border-neutral-600 transition-all duration-500`}
            >
              <Icon className="text-white dark:text-white" size={36} weight="light" />
            </div>
          </motion.div>

          {/* Premium Content */}
          <div className="relative z-10 space-y-6 flex-1">
            <div className="space-y-4">
              <h2 className="text-2xl lg:text-3xl font-display text-neutral-900 dark:text-white group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                {module.title}
              </h2>
              <p className="text-base lg:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-colors font-medium">
                {module.desc}
              </p>
            </div>
          </div>

          {/* Premium CTA - refined arrow appears on hover */}
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            whileHover={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 mt-10 flex items-center gap-3 text-red-600 dark:text-red-500 font-semibold text-sm uppercase tracking-wide"
          >
            <span>Open Module</span>
            <motion.svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              animate={{ x: [0, 6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M9 5l7 7-7 7"
              />
            </motion.svg>
          </motion.div>

          {/* Premium bottom accent - refined gradient bar */}
          <motion.div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-red-500/40 to-transparent opacity-40 group-hover:opacity-100 transition-opacity duration-500" />
        </motion.div>
      </Link>
    </motion.div>
  );
}
