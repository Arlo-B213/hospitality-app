// Premium Animation Configuration - Luxury & Sophisticated Motion
import { Variants } from "framer-motion";

// ============= PREMIUM SPRING PHYSICS =============
// Slower, more elegant motion - sophisticated over bouncy

export const SPRING_CONFIG = {
  // Stiff but elegant - minimal bounce, premium feel
  stiff: { type: "spring" as const, stiffness: 90, damping: 28 },
  // Bouncy but refined - gentle spring, not aggressive
  bouncy: { type: "spring" as const, stiffness: 70, damping: 22 },
  // Ultra smooth - luxury feel, premium spacing
  smooth: { type: "spring" as const, stiffness: 50, damping: 30 },
  // Molasses - ultra-slow, contemplative
  molasses: { type: "spring" as const, stiffness: 30, damping: 35 },
};

// Premium easing function
const PREMIUM_EASING = [0.32, 0.72, 0.3, 1];

// ============= CONTAINER ANIMATIONS =============

// Staggered cascade reveal - tighter, more refined
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.12,
    },
  },
};

// ============= CARD/ITEM ANIMATIONS =============

// Fade + scale reveal - premium feel
export const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 16 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: SPRING_CONFIG.molasses,
  },
};

// Slide from left - refined
export const slideLeftVariants: Variants = {
  hidden: { opacity: 0, x: -24 },
  show: {
    opacity: 1,
    x: 0,
    transition: SPRING_CONFIG.smooth,
  },
};

// Slide from right - refined
export const slideRightVariants: Variants = {
  hidden: { opacity: 0, x: 24 },
  show: {
    opacity: 1,
    x: 0,
    transition: SPRING_CONFIG.smooth,
  },
};

// Slide from top - refined
export const slideTopVariants: Variants = {
  hidden: { opacity: 0, y: -16 },
  show: {
    opacity: 1,
    y: 0,
    transition: SPRING_CONFIG.smooth,
  },
};

// ============= PERPETUAL ANIMATIONS - LUXURY & SUBTLE =============

// Premium glow animation - smooth, sophisticated
export const glowSweepVariants: Variants = {
  animate: {
    opacity: [0.4, 0.8, 0.4],
    transition: {
      duration: 4.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Subtle pulse - premium, refined (slower than original)
export const pulseVariants: Variants = {
  animate: {
    scale: [1, 1.03, 1],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Float effect - slow, sophisticated (increased from 3s)
export const floatVariants: Variants = {
  animate: {
    y: [0, -6, 0],
    transition: {
      duration: 4.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Slow drift - ultra-premium motion
export const driftVariants: Variants = {
  animate: {
    y: [0, -4, 0],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Shimmer effect - refined shimmer for premium surfaces
export const shimmerVariants: Variants = {
  animate: {
    backgroundPosition: ["200% center", "-200% center"],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

// Subtle rotate - refined spin animation
export const rotateVariants: Variants = {
  animate: {
    rotate: [0, 360],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

// ============= HOVER & INTERACTION ANIMATIONS =============

// Premium button hover - elegant scale
export const buttonHoverVariants: Variants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.02,
    transition: { duration: 0.4, ease: PREMIUM_EASING },
  },
  tap: { scale: 0.98 },
};

// Premium glow on hover - sophisticated red glow
export const glowVariants: Variants = {
  rest: {
    boxShadow: "0 0 0 0 rgba(220, 38, 38, 0)",
  },
  hover: {
    boxShadow: "0 0 28px 4px rgba(220, 38, 38, 0.2)",
    transition: { duration: 0.5, ease: PREMIUM_EASING },
  },
};

// Deep hover effect - glassmorphism enhancement
export const deepHoverVariants: Variants = {
  rest: {
    backdropFilter: "blur(8px)",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
  },
  hover: {
    backdropFilter: "blur(12px)",
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    transition: { duration: 0.5, ease: PREMIUM_EASING },
  },
};

// ============= FORM & INPUT ANIMATIONS =============

// Input focus with red underline reveal - premium
export const inputFocusVariants: Variants = {
  rest: {
    borderBottomColor: "rgba(212, 212, 212, 0.3)",
    backgroundColor: "rgba(248, 248, 248, 0.5)",
  },
  focus: {
    borderBottomColor: "rgb(220, 38, 38)",
    backgroundColor: "rgba(248, 248, 248, 1)",
    transition: { duration: 0.4, ease: PREMIUM_EASING },
  },
};

// Field slide in - refined entrance
export const fieldVariants: Variants = {
  hidden: { opacity: 0, x: -12 },
  show: {
    opacity: 1,
    x: 0,
    transition: SPRING_CONFIG.smooth,
  },
};

// ============= PROGRESS & DATA VISUALIZATION =============

// Progress bar fill - premium reveal
export const progressVariants: Variants = {
  hidden: { scaleX: 0, opacity: 0 },
  show: {
    scaleX: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 40,
      damping: 25,
      delay: 0.3,
    },
  },
};

// Bar chart animated reveal - staggered premium
export const barChartVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

// Individual bar animation - smooth emergence
export const barVariants: Variants = {
  hidden: { scaleY: 0, opacity: 0 },
  show: {
    scaleY: 1,
    opacity: 1,
    transition: SPRING_CONFIG.smooth,
  },
};

// ============= EXIT & TRANSITION ANIMATIONS =============

// Premium exit animation - elegant fade
export const exitVariants: Variants = {
  exit: {
    opacity: 0,
    scale: 0.97,
    transition: { duration: 0.3, ease: PREMIUM_EASING },
  },
};

// ============= PREMIUM BADGE ANIMATIONS =============

// Badge glow and scale
export const badgeVariants: Variants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.05,
    boxShadow: "0 0 16px rgba(220, 38, 38, 0.15)",
    transition: { duration: 0.4, ease: PREMIUM_EASING },
  },
};

// ============= EXPANDABLE & ACCORDION ANIMATIONS =============

// Smooth height expansion - premium
export const expandVariants: Variants = {
  collapsed: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.4, ease: PREMIUM_EASING },
  },
  expanded: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.5, ease: PREMIUM_EASING },
  },
};
