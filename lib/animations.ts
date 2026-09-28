// Animation configurations and utilities for PRIDE App
import { Variants } from "framer-motion";

// Spring physics configuration - responsive and bouncy
export const SPRING_CONFIG = {
  stiff: { type: "spring" as const, stiffness: 100, damping: 20 },
  bouncy: { type: "spring" as const, stiffness: 80, damping: 12 },
  smooth: { type: "spring" as const, stiffness: 60, damping: 25 },
};

// ============= CONTAINER ANIMATIONS =============

// Staggered cascade reveal for lists/grids
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

// ============= CARD/ITEM ANIMATIONS =============

// Fade + scale reveal
export const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 20 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: SPRING_CONFIG.smooth,
  },
};

// Slide from left
export const slideLeftVariants: Variants = {
  hidden: { opacity: 0, x: -30 },
  show: {
    opacity: 1,
    x: 0,
    transition: SPRING_CONFIG.smooth,
  },
};

// Slide from right
export const slideRightVariants: Variants = {
  hidden: { opacity: 0, x: 30 },
  show: {
    opacity: 1,
    x: 0,
    transition: SPRING_CONFIG.smooth,
  },
};

// Slide from top
export const slideTopVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  show: {
    opacity: 1,
    y: 0,
    transition: SPRING_CONFIG.smooth,
  },
};

// ============= MICRO-INTERACTIONS =============

// Perpetual pulse for icons/elements
export const pulseVariants: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Float effect (subtle up-down motion)
export const floatVariants: Variants = {
  animate: {
    y: [0, -8, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Shimmer effect for loading/hover
export const shimmerVariants: Variants = {
  animate: {
    backgroundPosition: ["200% center", "-200% center"],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

// ============= BUTTON ANIMATIONS =============

// Scale on hover/tap
export const buttonHoverVariants: Variants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.04,
    transition: SPRING_CONFIG.stiff,
  },
  tap: { scale: 0.98 },
};

// Red accent glow on hover
export const glowVariants: Variants = {
  rest: { boxShadow: "0 0 0 0 rgba(220, 38, 38, 0)" },
  hover: {
    boxShadow: "0 0 20px 2px rgba(220, 38, 38, 0.3)",
    transition: { duration: 0.3 },
  },
};

// ============= FORM ANIMATIONS =============

// Input focus reveal
export const inputFocusVariants: Variants = {
  rest: { borderColor: "rgb(38, 38, 38)", backgroundColor: "rgb(23, 23, 23)" },
  focus: {
    borderColor: "rgb(220, 38, 38)",
    backgroundColor: "rgb(31, 31, 31)",
    transition: { duration: 0.2 },
  },
};

// Field slide in
export const fieldVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  show: {
    opacity: 1,
    x: 0,
    transition: SPRING_CONFIG.smooth,
  },
};

// ============= PROGRESS/CHART ANIMATIONS =============

// Progress bar fill from left
export const progressVariants: Variants = {
  hidden: { scaleX: 0, opacity: 0 },
  show: {
    scaleX: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 50,
      damping: 20,
      delay: 0.2,
    },
  },
};

// Bar chart animated reveal
export const barChartVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const barVariants: Variants = {
  hidden: { scaleY: 0, opacity: 0 },
  show: {
    scaleY: 1,
    opacity: 1,
    transition: SPRING_CONFIG.bouncy,
  },
};

// ============= EXIT ANIMATIONS =============

export const exitVariants: Variants = {
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};
