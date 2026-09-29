'use client';

import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle,
  Target,
  Flag,
  Users,
  ArrowUpRight,
  Clock,
  Phone,
  ChatDots,
  ChartBar,
  Crown,
  Star,
  Lightning,
  Rocket,
  ShieldCheck,
  Trophy,
} from '@phosphor-icons/react';
import { useState, useEffect } from 'react';

// ============================================================================
// PRIDE LUXURY LANDING PAGE - MARKETING-GRADE PREMIUM DESIGN
// ============================================================================
// Luxury redesign with premium visual hierarchy, sophisticated color palette,
// glassmorphism effects, refined animations, and premium typography.
// Sections:
// 1. Hero (luxury asymmetric layout, maximum whitespace)
// 2. Manager Section (glass cards with premium shadows)
// 3. Leads Section (bento grid, glassmorphism, premium borders)
// 4. Milestones (premium timeline with gradient cards)
// 5. Social Proof (luxury testimonial cards with ratings)
// 6. CTA Footer (premium centered layout with trust badges)

const LUXURY_COLORS = {
  accent: '#dc2626', // Bold Red (strategic accent)
  text: '#0f0f0f', // Deep Charcoal (premium text)
  background: '#f8f8f8', // Cream/Platinum (luxury base)
  surface: '#ffffff', // Pure White (card backgrounds)
  secondary: '#1e293b', // Navy (secondary depth)
  gold: '#d4af37', // Luxury Gold (premium accents)
  muted: '#6b7280', // Gray (refined text)
  border: '#e5e5e5', // Subtle Silver (refined borders)
};

// ============================================================================
// LUXURY ANIMATION VARIANTS (Slower, Refined, Sophisticated)
// ============================================================================
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06, // Refined stagger
      delayChildren: 0.15,
    },
  },
} as const;

// Luxury entrance: fade + subtle scale
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 60, damping: 30 }, // Smooth, elegant
  },
} as const;

// Cascade reveal for luxury cards
const cascadeVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: (idx: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: idx * 0.06,
      type: 'spring' as const,
      stiffness: 60,
      damping: 30, // Smooth luxury feel
    },
  }),
} as const;

// Luxury float animation: subtle, slow breathing
const floatVariants = {
  float: {
    y: [0, -12, 0],
    transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' }, // Slower, sophisticated
  },
};

// Number counter animation
const CounterAnimation = ({ value, duration = 2 }: { value: number; duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationId: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);

      // Ease-out for natural feel
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeProgress * value));

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [value, duration]);

  return <>{count}</>;
};

// ============================================================================
// SECTION 1: HERO - Luxury Asymmetric Layout with Premium Spacing
// ============================================================================
function HeroSection() {
  return (
    <section
      className="relative min-h-screen overflow-hidden"
      style={{ backgroundColor: LUXURY_COLORS.background }}
    >
      {/* Premium Gradient Overlay (45° diagonal) */}
      <motion.div
        className="absolute inset-0 opacity-40"
        style={{
          background: `linear-gradient(45deg, ${LUXURY_COLORS.accent}08, transparent 60%)`,
        }}
      />

      {/* Subtle Animated Blobs - Minimal, Refined */}
      <motion.div
        className="absolute -top-96 -right-96 w-[800px] h-[800px] rounded-full opacity-5"
        style={{
          background: `radial-gradient(circle, ${LUXURY_COLORS.accent}, transparent)`,
        }}
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute -bottom-96 -left-96 w-[800px] h-[800px] rounded-full opacity-5"
        style={{
          background: `radial-gradient(circle, ${LUXURY_COLORS.secondary}, transparent)`,
        }}
        animate={{
          scale: [1.05, 1, 1.05],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      <div
        className="relative max-w-7xl mx-auto px-[10vw] py-32 md:py-40 flex items-center justify-between gap-20"
      >
        <motion.div
          className="flex-1 max-w-2xl"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {/* Premium Badge */}
          <motion.div
            className="inline-flex items-center gap-3 mb-8 px-4 py-2 rounded-full"
            style={{
              backgroundColor: `${LUXURY_COLORS.accent}10`,
              border: `1px solid ${LUXURY_COLORS.border}`,
            }}
            variants={itemVariants}
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Crown size={18} weight="bold" color={LUXURY_COLORS.accent} />
            </motion.div>
            <span
              className="text-sm font-semibold tracking-wide"
              style={{ color: LUXURY_COLORS.accent }}
            >
              Trusted by 50+ Premium Brands
            </span>
          </motion.div>

          {/* Premium Hero Headline: 60-80px clamp */}
          <motion.h1
            className="text-[clamp(48px,8vw,80px)] font-800 tracking-tight leading-[1.15] mb-10"
            style={{ color: LUXURY_COLORS.text }}
            variants={itemVariants}
          >
            Transform Your Onboarding in{' '}
            <motion.span
              style={{ color: LUXURY_COLORS.accent }}
              animate={{ opacity: [1, 0.8, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              90 Days
            </motion.span>
          </motion.h1>

          {/* Premium Subheading: 18-20px */}
          <motion.p
            className="text-[18px] md:text-[20px] font-400 leading-[1.7] mb-14 max-w-[65ch]"
            style={{ color: LUXURY_COLORS.muted }}
            variants={itemVariants}
          >
            Real-time evaluations, measurable growth, and genuine team development. PRIDE is the platform trusted by hospitality's most premium brands.
          </motion.p>

          {/* Premium CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-6"
            variants={itemVariants}
          >
            <motion.button
              className="px-10 py-4 rounded-full font-bold text-lg text-white relative overflow-hidden group"
              style={{
                backgroundColor: LUXURY_COLORS.accent,
                boxShadow: `0 20px 60px ${LUXURY_COLORS.accent}20, 0 4px 12px ${LUXURY_COLORS.accent}10`,
              }}
              whileHover={{
                scale: 1.02,
                y: -2,
                boxShadow: `0 30px 70px ${LUXURY_COLORS.accent}30, 0 6px 16px ${LUXURY_COLORS.accent}15`,
              }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.span
                className="absolute inset-0 opacity-0 group-hover:opacity-15"
                style={{ backgroundColor: '#ffffff' }}
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              <span className="relative">Start Free Trial</span>
            </motion.button>

            <motion.button
              className="px-10 py-4 rounded-full font-bold text-lg border transition-all group"
              style={{
                color: LUXURY_COLORS.accent,
                borderColor: LUXURY_COLORS.border,
                borderWidth: '1px',
                backgroundColor: 'transparent',
              }}
              whileHover={{
                scale: 1.02,
                y: -2,
                backgroundColor: `${LUXURY_COLORS.accent}08`,
                borderColor: LUXURY_COLORS.accent,
              }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative">Request Demo</span>
            </motion.button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            className="mt-16 flex flex-wrap gap-8"
            variants={itemVariants}
          >
            {[
              { icon: ShieldCheck, text: 'Free Setup, 5 Team Members' },
              { icon: Trophy, text: 'Industry-Leading Support' },
            ].map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <motion.div
                  key={idx}
                  className="flex items-center gap-3"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: idx * 0.2 }}
                >
                  <IconComponent
                    size={20}
                    weight="bold"
                    color={LUXURY_COLORS.accent}
                  />
                  <span
                    className="text-sm font-500"
                    style={{ color: LUXURY_COLORS.muted }}
                  >
                    {item.text}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>

        {/* Right: Premium Timeline Visualization */}
        <motion.div
          className="hidden lg:block flex-1"
          variants={itemVariants}
        >
          <TimelineVisualization />
        </motion.div>
      </div>
    </section>
  );
}

// Premium Timeline Visualization with Luxury Styling
function TimelineVisualization() {
  const milestones = [
    { day: 1, label: 'Foundation', icon: Flag },
    { day: 30, label: 'Development', icon: Target },
    { day: 90, label: 'Mastery', icon: Crown },
  ];

  return (
    <div className="relative h-80 flex items-center justify-center">
      {/* Luxury Timeline Line */}
      <svg viewBox="0 0 300 250" className="w-full h-full absolute inset-0">
        {/* Background Timeline Line */}
        <motion.line
          x1="20"
          y1="120"
          x2="280"
          y2="120"
          stroke={LUXURY_COLORS.border}
          strokeWidth="1"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />

        {/* Premium Gradient Line */}
        <defs>
          <linearGradient id="gradientLine" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={LUXURY_COLORS.accent} stopOpacity="0.3" />
            <stop offset="50%" stopColor={LUXURY_COLORS.accent} stopOpacity="1" />
            <stop offset="100%" stopColor={LUXURY_COLORS.accent} stopOpacity="0.3" />
          </linearGradient>
        </defs>

        <motion.line
          x1="20"
          y1="120"
          x2="280"
          y2="120"
          stroke="url(#gradientLine)"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.8, ease: 'easeInOut', delay: 0.2 }}
        />
      </svg>

      {/* Milestone Markers */}
      <div className="absolute inset-0 flex items-center justify-between px-8">
        {milestones.map((milestone, idx) => {
          const IconComponent = milestone.icon;

          return (
            <motion.div
              key={idx}
              className="relative flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                delay: idx * 0.2 + 0.2,
                type: 'spring',
                stiffness: 60,
                damping: 30,
              }}
            >
              {/* Premium Pulse Ring */}
              <motion.div
                className="absolute w-20 h-20 rounded-full"
                style={{
                  border: `1px solid ${LUXURY_COLORS.accent}`,
                  opacity: 0.4,
                }}
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ duration: 3, repeat: Infinity, delay: idx * 0.3 }}
              />

              {/* Icon Circle with Shadow */}
              <motion.div
                className="relative w-14 h-14 rounded-full flex items-center justify-center text-white z-10 mb-8"
                style={{
                  backgroundColor: LUXURY_COLORS.accent,
                  boxShadow: `0 12px 32px ${LUXURY_COLORS.accent}25, 0 2px 8px ${LUXURY_COLORS.accent}15`,
                }}
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, delay: idx * 0.15 }}
              >
                <IconComponent size={28} weight="bold" />
              </motion.div>

              {/* Premium Labels */}
              <motion.div className="text-center mt-4" initial={{ opacity: 0, y: 8 }}>
                <div
                  className="text-xs font-bold uppercase tracking-wide"
                  style={{ color: LUXURY_COLORS.accent }}
                >
                  Day {milestone.day}
                </div>
                <div
                  className="text-base font-bold mt-2"
                  style={{ color: LUXURY_COLORS.text }}
                >
                  {milestone.label}
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// SECTION 2: MANAGER SECTION - Premium Glass Cards with Luxury Metrics
// ============================================================================
function ManagerSection() {
  const metrics = [
    {
      value: 40,
      label: 'Higher Retention',
      description: 'New hires stay longer with measurable growth',
      icon: ArrowUpRight,
    },
    {
      value: 60,
      label: 'Time Saved',
      description: 'Hours saved per hire in evaluations',
      icon: Clock,
    },
    {
      value: 100,
      label: 'Team Participation',
      description: 'Real-time participation and engagement',
      icon: Users,
    },
  ];

  return (
    <section
      className="py-32 md:py-40"
      style={{ backgroundColor: LUXURY_COLORS.background }}
    >
      <div className="max-w-7xl mx-auto px-[10vw]">
        {/* Premium Section Headline */}
        <motion.h2
          className="text-[clamp(36px,6vw,48px)] font-bold tracking-tight leading-[1.2] mb-24"
          style={{ color: LUXURY_COLORS.text }}
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          Real-Time Visibility Into Your Team's Growth
        </motion.h2>

        {/* Premium 3-Column Glass Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {metrics.map((metric, idx) => {
            const IconComponent = metric.icon;

            return (
              <motion.div
                key={idx}
                className="p-12 rounded-3xl relative overflow-hidden group"
                style={{
                  backgroundColor: LUXURY_COLORS.surface,
                  border: `1px solid ${LUXURY_COLORS.border}`,
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  boxShadow: `0 20px 60px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)`,
                }}
                variants={cascadeVariants}
                custom={idx}
                whileHover={{
                  y: -8,
                  boxShadow: `0 40px 80px rgba(220,38,38,0.12), 0 8px 20px rgba(0,0,0,0.08)`,
                }}
              >
                {/* Hover Gradient Effect */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at 50% 50%, ${LUXURY_COLORS.accent}08, transparent 70%)`,
                  }}
                  transition={{ duration: 0.4 }}
                />

                {/* Premium Icon */}
                <motion.div
                  className="mb-10 relative z-10"
                  animate={{ rotate: [0, 3, -3, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: idx * 0.2 }}
                >
                  <IconComponent
                    size={48}
                    color={LUXURY_COLORS.accent}
                    weight="bold"
                  />
                </motion.div>

                {/* Premium Counter */}
                <motion.div
                  className="text-[clamp(48px,8vw,72px)] font-bold mb-6 relative z-10 leading-none"
                  style={{ color: LUXURY_COLORS.accent }}
                >
                  <CounterAnimation value={metric.value} duration={2.5} />
                  <span className="text-4xl">%</span>
                </motion.div>

                {/* Premium Label */}
                <motion.div
                  className="text-lg font-bold mb-4 relative z-10"
                  style={{ color: LUXURY_COLORS.text }}
                >
                  {metric.label}
                </motion.div>

                {/* Premium Description */}
                <motion.div
                  className="text-base leading-relaxed relative z-10"
                  style={{ color: LUXURY_COLORS.muted }}
                >
                  {metric.description}
                </motion.div>

                {/* Subtle Live Indicator */}
                <motion.div
                  className="absolute top-6 right-6 flex items-center gap-2 relative z-10"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  <motion.div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: LUXURY_COLORS.accent }}
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  />
                  <span
                    className="text-xs font-semibold"
                    style={{ color: LUXURY_COLORS.accent }}
                  >
                    Live
                  </span>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// SECTION 3: LEADS SECTION - Premium Bento Grid with Glassmorphism
// ============================================================================
function LeadsSection() {
  const features = [
    {
      title: 'Evaluate Anywhere',
      description: 'Rate skills on your phone during shifts. No waiting for meetings. Real-time feedback that drives growth.',
      icon: Phone,
    },
    {
      title: 'See Real-Time Feedback',
      description: 'New hire sees your feedback instantly with detailed insights.',
      icon: ChatDots,
    },
    {
      title: 'Track What Matters',
      description: 'Technical, soft skills, leadership. All in one unified place.',
      icon: ChartBar,
    },
  ];

  return (
    <section
      className="py-32 md:py-40"
      style={{ backgroundColor: LUXURY_COLORS.background }}
    >
      <div className="max-w-7xl mx-auto px-[10vw]">
        {/* Premium Section Headline */}
        <motion.h2
          className="text-[clamp(36px,6vw,48px)] font-bold tracking-tight leading-[1.2] mb-24"
          style={{ color: LUXURY_COLORS.text }}
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          Feedback That Sticks. Progress You Can See.
        </motion.h2>

        {/* Premium Bento Grid Layout */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-[minmax(280px,auto)]"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {/* Large Featured Card: md:col-span-2, md:row-span-2 */}
          <motion.div
            className="md:col-span-2 md:row-span-2 p-14 rounded-3xl relative overflow-hidden group"
            style={{
              backgroundColor: LUXURY_COLORS.surface,
              border: `1px solid ${LUXURY_COLORS.border}`,
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              boxShadow: `0 20px 60px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)`,
            }}
            custom={0}
            variants={cascadeVariants}
            whileHover={{
              y: -8,
              boxShadow: `0 40px 80px rgba(220,38,38,0.12), 0 8px 20px rgba(0,0,0,0.08)`,
            }}
          >
            {/* Premium Gradient Overlay */}
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 50% 50%, ${LUXURY_COLORS.accent}08, transparent 70%)`,
              }}
              transition={{ duration: 0.5 }}
            />

            <motion.div
              className="relative z-10 flex flex-col justify-between h-full"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <div className="mb-8">
                <motion.div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8"
                  style={{
                    backgroundColor: `${LUXURY_COLORS.accent}12`,
                  }}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Phone size={40} color={LUXURY_COLORS.accent} weight="bold" />
                </motion.div>

                <h3
                  className="text-[clamp(24px,5vw,36px)] font-bold mb-6 leading-tight"
                  style={{ color: LUXURY_COLORS.text }}
                >
                  {features[0].title}
                </h3>

                <p
                  className="text-lg leading-relaxed"
                  style={{ color: LUXURY_COLORS.muted }}
                >
                  {features[0].description}
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Small Cards Grid: Right Column */}
          {features.slice(1).map((feature, idx) => {
            const IconComponent = feature.icon;

            return (
              <motion.div
                key={idx}
                className="p-10 rounded-3xl relative overflow-hidden group"
                style={{
                  backgroundColor: LUXURY_COLORS.surface,
                  border: `1px solid ${LUXURY_COLORS.border}`,
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  boxShadow: `0 20px 60px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)`,
                }}
                custom={idx + 1}
                variants={cascadeVariants}
                whileHover={{
                  y: -6,
                  boxShadow: `0 30px 70px rgba(220,38,38,0.10), 0 6px 16px rgba(0,0,0,0.08)`,
                }}
              >
                {/* Hover Gradient */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100"
                  style={{
                    background: `linear-gradient(135deg, ${LUXURY_COLORS.accent}06, transparent 70%)`,
                  }}
                  transition={{ duration: 0.4 }}
                />

                <motion.div
                  className="relative z-10 flex flex-col"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, delay: idx * 0.15 }}
                >
                  <motion.div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
                    style={{
                      backgroundColor: `${LUXURY_COLORS.accent}12`,
                    }}
                    animate={{ rotate: [0, 6, -6, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <IconComponent
                      size={28}
                      color={LUXURY_COLORS.accent}
                      weight="bold"
                    />
                  </motion.div>

                  <h3
                    className="font-bold mb-3 text-lg"
                    style={{ color: LUXURY_COLORS.text }}
                  >
                    {feature.title}
                  </h3>

                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: LUXURY_COLORS.muted }}
                  >
                    {feature.description}
                  </p>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// SECTION 4: MILESTONES - Premium Timeline with Gradient Cards
// ============================================================================
function NewHiresSection() {
  const milestones = [
    { phase: 'Days 1-30', title: 'Foundation', icon: Flag },
    {
      phase: 'Days 31-60',
      title: 'Development',
      icon: Target,
    },
    { phase: 'Days 61-90', title: 'Mastery', icon: Crown },
  ];

  return (
    <section
      className="py-32 md:py-40"
      style={{ backgroundColor: LUXURY_COLORS.background }}
    >
      <div className="max-w-7xl mx-auto px-[10vw]">
        {/* Premium Section Headline */}
        <motion.h2
          className="text-[clamp(36px,6vw,48px)] font-bold tracking-tight leading-[1.2] mb-24"
          style={{ color: LUXURY_COLORS.text }}
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          See Your Progress. Celebrate Your Growth.
        </motion.h2>

        {/* Premium 3-Column Timeline Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {milestones.map((milestone, idx) => {
            const IconComponent = milestone.icon;

            return (
              <motion.div
                key={idx}
                className="relative p-12 rounded-3xl text-center overflow-hidden group"
                style={{
                  backgroundColor: LUXURY_COLORS.surface,
                  border: `1px solid ${LUXURY_COLORS.border}`,
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  boxShadow: `0 20px 60px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)`,
                  background: `linear-gradient(135deg, ${LUXURY_COLORS.surface}, ${LUXURY_COLORS.accent}02)`,
                }}
                custom={idx}
                variants={cascadeVariants}
                whileHover={{
                  y: -8,
                  boxShadow: `0 40px 80px rgba(220,38,38,0.12), 0 8px 20px rgba(0,0,0,0.08)`,
                }}
              >
                {/* Premium Gradient Background */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none rounded-3xl"
                  style={{
                    background: `linear-gradient(135deg, ${LUXURY_COLORS.accent}08, transparent 70%)`,
                  }}
                  transition={{ duration: 0.5 }}
                />

                {/* Premium Icon Badge */}
                <motion.div
                  className="relative z-10 w-20 h-20 mx-auto rounded-full mb-10 flex items-center justify-center text-white"
                  style={{
                    backgroundColor: LUXURY_COLORS.accent,
                    boxShadow: `0 16px 40px ${LUXURY_COLORS.accent}30, 0 4px 12px ${LUXURY_COLORS.accent}20`,
                  }}
                  animate={{
                    y: [0, -8, 0],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: idx * 0.2,
                    ease: 'easeInOut',
                  }}
                >
                  <IconComponent size={40} weight="bold" />
                </motion.div>

                {/* Premium Phase Label */}
                <motion.div
                  className="text-xs font-bold uppercase tracking-widest mb-4 relative z-10"
                  style={{ color: LUXURY_COLORS.accent }}
                  animate={{ opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 3.5, repeat: Infinity }}
                >
                  {milestone.phase}
                </motion.div>

                {/* Premium Title */}
                <motion.h3
                  className="text-[clamp(24px,4vw,32px)] font-bold relative z-10 leading-tight"
                  style={{ color: LUXURY_COLORS.text }}
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: idx * 0.15 }}
                >
                  {milestone.title}
                </motion.h3>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Premium Progress Indicator */}
        <motion.div className="mt-20 flex justify-center items-center gap-4">
          {milestones.map((_, idx) => (
            <motion.div
              key={idx}
              className="rounded-full"
              style={{
                backgroundColor: LUXURY_COLORS.accent,
                height: '4px',
              }}
              animate={{
                width: ['0.5rem', '2rem', '0.5rem'],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: idx * 0.3,
              }}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// SECTION 5: SOCIAL PROOF - Premium Testimonial Carousel
// ============================================================================
function SocialProofSection() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  const testimonials = [
    {
      quote: 'We transformed from spreadsheets to real-time insights. The impact on retention has been extraordinary.',
      author: 'Marcus Chen',
      role: 'Manager',
      company: 'The Ritz-Carlton',
      rating: 5,
    },
    {
      quote: 'Our team sees measurable growth they can actually track. Retention improved dramatically across all locations.',
      author: 'Sofia Rodriguez',
      role: 'Regional Director',
      company: 'Marriott International',
      rating: 5,
    },
    {
      quote: 'PRIDE made evaluating new hires 60% faster. Best platform we have invested in.',
      author: 'James Mitchell',
      role: 'Executive Chef',
      company: 'The Peninsula',
      rating: 5,
    },
  ];

  // Auto-advance carousel
  useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [autoPlay, testimonials.length]);

  return (
    <section
      className="py-32 md:py-40"
      style={{ backgroundColor: LUXURY_COLORS.background }}
    >
      <div className="max-w-5xl mx-auto px-[10vw]">
        {/* Premium Section Header */}
        <motion.div className="text-center mb-24">
          <motion.h2
            className="text-[clamp(36px,6vw,48px)] font-bold tracking-tight leading-[1.2] mb-8"
            style={{ color: LUXURY_COLORS.text }}
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            Trusted by Premium Hospitality Brands
          </motion.h2>

          <motion.p
            className="text-lg leading-relaxed max-w-2xl mx-auto"
            style={{ color: LUXURY_COLORS.muted }}
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            Join 50+ premium hotels and restaurants tracking 2,000+ new hires with measurable results
          </motion.p>
        </motion.div>

        {/* Premium Testimonial Carousel */}
        <motion.div
          className="relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          onMouseEnter={() => setAutoPlay(false)}
          onMouseLeave={() => setAutoPlay(true)}
        >
          {/* Premium Testimonial Card */}
          <motion.div
            key={activeSlide}
            className="p-16 rounded-3xl text-center relative overflow-hidden"
            style={{
              backgroundColor: LUXURY_COLORS.surface,
              border: `1px solid ${LUXURY_COLORS.border}`,
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              boxShadow: `0 20px 60px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)`,
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 60, damping: 30 }}
          >
            {/* Premium Background Gradient */}
            <motion.div
              className="absolute inset-0 opacity-50"
              style={{
                background: `radial-gradient(circle at 50% 50%, ${LUXURY_COLORS.accent}04, transparent 70%)`,
              }}
              animate={{
                scale: [1, 1.02, 1],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />

            {/* Premium Star Rating */}
            <motion.div
              className="flex justify-center gap-2 mb-10 relative z-10"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {Array.from({ length: testimonials[activeSlide].rating }).map((_, idx) => (
                <Star
                  key={idx}
                  size={24}
                  color={LUXURY_COLORS.gold}
                  weight="fill"
                />
              ))}
            </motion.div>

            {/* Premium Quote */}
            <motion.div
              className="mb-12 relative z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <p
                className="text-[clamp(20px,4vw,32px)] font-medium leading-[1.5]"
                style={{ color: LUXURY_COLORS.text }}
              >
                "{testimonials[activeSlide].quote}"
              </p>
            </motion.div>

            {/* Premium Author Info */}
            <motion.div
              className="relative z-10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="font-bold text-lg" style={{ color: LUXURY_COLORS.text }}>
                {testimonials[activeSlide].author}
              </div>
              <div className="text-sm mt-2" style={{ color: LUXURY_COLORS.muted }}>
                {testimonials[activeSlide].role} at{' '}
                <span style={{ color: LUXURY_COLORS.accent, fontWeight: 600 }}>
                  {testimonials[activeSlide].company}
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* Premium Carousel Controls */}
          <motion.div
            className="flex justify-center gap-4 mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {testimonials.map((_, idx) => (
              <motion.button
                key={idx}
                className="rounded-full transition-all"
                style={{
                  width: idx === activeSlide ? '2rem' : '0.75rem',
                  height: '0.75rem',
                  backgroundColor:
                    idx === activeSlide ? LUXURY_COLORS.accent : LUXURY_COLORS.border,
                }}
                onClick={() => {
                  setActiveSlide(idx);
                  setAutoPlay(false);
                }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
              >
                {idx === activeSlide && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundColor: LUXURY_COLORS.gold }}
                    animate={{ x: ['100%', '-100%'] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  />
                )}
              </motion.button>
            ))}
          </motion.div>

          {/* Premium Progress Indicator */}
          <motion.div
            className="mt-10 h-1 rounded-full"
            style={{ backgroundColor: LUXURY_COLORS.border }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: LUXURY_COLORS.accent }}
              animate={{ width: `${((activeSlide + 1) / testimonials.length) * 100}%` }}
              transition={{ duration: 0.6 }}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// SECTION 6: CTA FOOTER - Premium Centered Layout with Trust Badges
// ============================================================================
function CTAFooterSection() {
  return (
    <section className="relative py-32 md:py-40 overflow-hidden">
      {/* Premium Gradient Background */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${LUXURY_COLORS.text}95 0%, ${LUXURY_COLORS.secondary}90 50%, ${LUXURY_COLORS.text}95 100%)`,
        }}
      />

      {/* Subtle Animated Blobs */}
      <motion.div
        className="absolute top-10 right-10 w-96 h-96 rounded-full opacity-8 blur-3xl"
        style={{ background: LUXURY_COLORS.gold }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.05, 0.12, 0.05],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <motion.div
        className="absolute bottom-0 left-10 w-96 h-96 rounded-full opacity-5 blur-3xl"
        style={{ background: LUXURY_COLORS.accent }}
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.03, 0.08, 0.03],
        }}
        transition={{ duration: 10, repeat: Infinity, delay: 1 }}
      />

      <div className="relative max-w-4xl mx-auto px-[10vw] text-center">
        {/* Premium Main Heading */}
        <motion.h2
          className="text-[clamp(40px,8vw,72px)] font-bold tracking-tight leading-[1.15] mb-12 text-white"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {['Ready to Transform', 'Your Onboarding?'].map((text, idx) => (
            <motion.div key={idx} variants={itemVariants} className="inline-block mr-2">
              {text}
            </motion.div>
          ))}
        </motion.h2>

        {/* Premium Subheading */}
        <motion.p
          className="text-lg md:text-xl mb-16 leading-relaxed max-w-2xl mx-auto"
          style={{ color: 'rgba(255,255,255,0.9)' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          No credit card required. Start your free trial today with 5 team members
          and see measurable results in your first week.
        </motion.p>

        {/* Premium CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row justify-center gap-6 mb-20"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Primary Button */}
          <motion.button
            className="px-12 py-5 rounded-full font-bold text-lg text-center relative overflow-hidden group flex items-center justify-center gap-2"
            style={{
              backgroundColor: LUXURY_COLORS.accent,
              color: 'white',
              boxShadow: `0 20px 60px ${LUXURY_COLORS.accent}40, 0 4px 12px ${LUXURY_COLORS.accent}25`,
            }}
            variants={itemVariants}
            whileHover={{
              scale: 1.02,
              y: -2,
              boxShadow: `0 30px 70px ${LUXURY_COLORS.accent}50, 0 6px 16px ${LUXURY_COLORS.accent}35`,
            }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Shimmer Effect */}
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-20"
              style={{
                background: `linear-gradient(90deg, transparent, white, transparent)`,
              }}
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />

            <span className="relative flex items-center gap-2">
              Start Free Trial
              <motion.span
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight size={22} weight="bold" />
              </motion.span>
            </span>
          </motion.button>

          {/* Secondary Button */}
          <motion.button
            className="px-12 py-5 rounded-full font-bold text-lg relative overflow-hidden group transition-all"
            style={{
              color: 'white',
              borderWidth: '1px',
              borderColor: 'rgba(255,255,255,0.3)',
              backgroundColor: 'transparent',
            }}
            variants={itemVariants}
            whileHover={{
              scale: 1.02,
              y: -2,
              backgroundColor: 'rgba(255,255,255,0.12)',
              borderColor: 'rgba(255,255,255,0.6)',
            }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Gradient Border Animation */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: `linear-gradient(90deg, ${LUXURY_COLORS.gold}, ${LUXURY_COLORS.accent}, ${LUXURY_COLORS.gold})`,
                backgroundSize: '200% 200%',
                opacity: 0,
                zIndex: 0,
              }}
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                opacity: [0, 0.2, 0],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            <span className="relative z-10">Request a Demo</span>
          </motion.button>
        </motion.div>

        {/* Premium Trust Badges */}
        <motion.div
          className="flex flex-wrap justify-center gap-8 md:gap-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          {[
            { icon: ShieldCheck, text: 'Enterprise-Grade Security' },
            { icon: Trophy, text: 'Premium Support' },
            { icon: Lightning, text: 'Instant Setup' },
          ].map((badge, idx) => {
            const IconComponent = badge.icon;

            return (
              <motion.div
                key={idx}
                className="flex items-center gap-3"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: idx * 0.15 }}
              >
                <div
                  className="flex-shrink-0"
                  style={{ color: LUXURY_COLORS.gold }}
                >
                  <IconComponent size={22} weight="bold" />
                </div>
                <span
                  className="font-semibold"
                  style={{ color: 'rgba(255,255,255,0.9)' }}
                >
                  {badge.text}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// MAIN LANDING PAGE EXPORT - LUXURY DESIGN SYSTEM
// ============================================================================
export default function LandingPage() {
  return (
    <main
      className="overflow-hidden"
      style={{ backgroundColor: LUXURY_COLORS.background }}
    >
      <HeroSection />
      <ManagerSection />
      <LeadsSection />
      <NewHiresSection />
      <SocialProofSection />
      <CTAFooterSection />
    </main>
  );
}
