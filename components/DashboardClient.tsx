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
    <div className="space-y-12 md:space-y-16">
      {/* Header Section */}
      <motion.div
        initial="hidden"
        animate={isLoaded ? "show" : "hidden"}
        variants={slideTopVariants}
        className="space-y-6"
      >
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            A Complete Hospitality Leadership & Soft Skills Development System
          </h1>
          <p className="text-lg text-neutral-400 max-w-4xl leading-relaxed">
            Build the system once, make it repeatable, then trust your people
            to run it. Five pillars, four floor modules, one operating system
            for how leaders think under pressure.
          </p>
          <div className="flex items-center gap-3 pt-4">
            <span className="text-sm font-medium text-neutral-300">
              {user.outlet.name}
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-red-600"></span>
            <span className="text-sm text-neutral-400">
              {user.outlet.tier.replace("_", " ")}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid - Staggered Cascade */}
      <motion.div
        initial="hidden"
        animate={isLoaded ? "show" : "hidden"}
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
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

      {/* Module Cards - Animated Grid with Hover Effects */}
      <motion.div
        initial="hidden"
        animate={isLoaded ? "show" : "hidden"}
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
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
        className="group relative h-full overflow-hidden rounded-2xl border border-neutral-800 bg-gradient-to-br from-neutral-900 to-neutral-800 p-8 transition-all"
      >
        {/* Animated background gradient */}
        <motion.div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Content */}
        <div className="relative z-10 space-y-4">
          <motion.div
            animate="animate"
            variants={pulseVariants}
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/20 flex items-center justify-center"
          >
            <Icon className="text-red-500" size={24} weight="duotone" />
          </motion.div>

          <div className="space-y-2">
            <motion.div
              className="text-4xl md:text-5xl font-bold text-white"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.1, duration: 0.6 }}
            >
              {value}
            </motion.div>
            <p className="text-sm font-medium text-neutral-400">{label}</p>
          </div>
        </div>

        {/* Bottom accent bar */}
        <motion.div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-red-500 to-transparent" />
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
      <Link href={module.href}>
        <motion.div
          whileHover="hover"
          initial="rest"
          variants={glowVariants}
          className="group relative overflow-hidden rounded-2xl border border-neutral-800 bg-gradient-to-br from-neutral-900 to-neutral-800 p-8 md:p-10 transition-all cursor-pointer h-full flex flex-col justify-between"
        >
          {/* Animated background gradient */}
          <motion.div
            className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
          />

          {/* Icon with float animation */}
          <motion.div
            animate="animate"
            variants={floatVariants}
            className="relative z-10 mb-6"
          >
            <div
              className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${module.color} border border-neutral-700 flex items-center justify-center group-hover:border-neutral-600 transition-colors`}
            >
              <Icon className="text-white" size={32} weight="duotone" />
            </div>
          </motion.div>

          {/* Content */}
          <div className="relative z-10 space-y-4 flex-1">
            <div className="space-y-2">
              <h2 className="text-xl md:text-2xl font-bold text-white group-hover:text-white transition-colors">
                {module.title}
              </h2>
              <p className="text-sm md:text-base text-neutral-300 leading-relaxed group-hover:text-neutral-200 transition-colors">
                {module.desc}
              </p>
            </div>
          </div>

          {/* CTA Arrow - appears on hover */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            whileHover={{ opacity: 1, x: 0 }}
            className="relative z-10 mt-8 flex items-center gap-2 text-red-500 font-medium text-sm"
          >
            <span>Open Module</span>
            <motion.svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </motion.svg>
          </motion.div>

          {/* Bottom accent bar */}
          <motion.div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-red-500 to-transparent" />
        </motion.div>
      </Link>
    </motion.div>
  );
}
