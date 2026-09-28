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
} from '@phosphor-icons/react';
import { useState, useEffect } from 'react';

// ============================================================================
// PRIDE LANDING PAGE - MAXIMUM ANIMATIONS & PROFESSIONAL ICONS
// ============================================================================
// Enhanced landing page with 6 sections:
// 1. Hero Journey (90-day timeline with parallax)
// 2. Manager Section (animated metrics with counters)
// 3. Leads Section (cascade reveals with spotlight borders)
// 4. New Hires Section (sequential milestone animations)
// 5. Social Proof (carousel with smooth transitions)
// 6. CTA Footer (gradient animations & text reveals)

const PRIDE_COLORS = {
  accent: '#dc2626', // Bold Dark Red
  secondary: '#f59e0b', // Warm Gold
  surface: '#f9fafb', // Off-White
  text: '#18181b', // Zinc-950
  muted: '#71717a', // Zinc-600
  border: '#e4e4e7', // Zinc-200
};

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 80, damping: 18 },
  },
};

// Cascade reveal for cards
const cascadeVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.92 },
  visible: (idx: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: idx * 0.15,
      type: 'spring',
      stiffness: 90,
      damping: 20,
    },
  }),
};

// Float animation
const floatVariants = {
  float: {
    y: [0, -20, 0],
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
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
// SECTION 1: HERO - 90-Day Journey with Parallax & Maximum Animations
// ============================================================================
function HeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    setMousePosition({
      x: (clientX - innerWidth / 2) * 0.02,
      y: (clientY - innerHeight / 2) * 0.02,
    });
  };

  return (
    <section
      className="relative min-h-[100dvh] overflow-hidden bg-gradient-to-br from-white via-emerald-50/30 to-amber-50/30"
      onMouseMove={handleMouseMove}
    >
      {/* Animated Background Blobs */}
      <motion.div
        className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{
          background: `linear-gradient(135deg, ${PRIDE_COLORS.accent}, ${PRIDE_COLORS.secondary})`,
        }}
        animate={{
          y: [0, 40, 0],
          x: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full opacity-15 blur-3xl"
        style={{
          background: `linear-gradient(135deg, ${PRIDE_COLORS.secondary}, ${PRIDE_COLORS.accent})`,
        }}
        animate={{
          y: [0, -40, 0],
          x: [0, -30, 0],
          scale: [1, 0.9, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-28">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {/* Left: Hero Text */}
          <motion.div className="order-2 md:order-1" variants={itemVariants}>
            <motion.div className="flex items-center gap-3 mb-6" variants={itemVariants}>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Rocket size={32} weight="bold" color={PRIDE_COLORS.accent} />
              </motion.div>
              <span
                className="text-sm font-bold uppercase tracking-widest"
                style={{ color: PRIDE_COLORS.accent }}
              >
                Transform Your Team
              </span>
            </motion.div>

            <motion.h1
              className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight mb-8"
              style={{ color: PRIDE_COLORS.text }}
              variants={itemVariants}
            >
              Transform Your Onboarding in{' '}
              <motion.span
                style={{ color: PRIDE_COLORS.accent }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                90 Days
              </motion.span>
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl mb-10 leading-relaxed max-w-[65ch]"
              style={{ color: PRIDE_COLORS.muted }}
              variants={itemVariants}
            >
              Real-time evaluations. Measurable growth. One platform.
            </motion.p>

            {/* CTA Buttons with Magnetic Hover */}
            <motion.div
              className="flex flex-col sm:flex-row gap-6"
              variants={itemVariants}
            >
              <motion.button
                className="px-10 py-4 rounded-full font-bold text-lg text-white transition-all relative overflow-hidden group"
                style={{ backgroundColor: PRIDE_COLORS.accent }}
                whileHover={{ scale: 1.08, y: -4 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.span
                  className="absolute inset-0 opacity-0 group-hover:opacity-20"
                  style={{ backgroundColor: '#ffffff' }}
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                Start Free Trial
              </motion.button>

              <motion.button
                className="px-10 py-4 rounded-full font-bold text-lg border-2 transition-all"
                style={{
                  color: PRIDE_COLORS.accent,
                  borderColor: PRIDE_COLORS.accent,
                }}
                whileHover={{ scale: 1.08, y: -4, backgroundColor: `${PRIDE_COLORS.accent}10` }}
                whileTap={{ scale: 0.95 }}
              >
                Request Demo
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Right: Hero Visual with Parallax */}
          <motion.div
            className="order-1 md:order-2"
            variants={itemVariants}
            style={{
              x: mousePosition.x,
              y: mousePosition.y,
            }}
            transition={{ type: 'spring', stiffness: 100, damping: 30 }}
          >
            <TimelineVisualization />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// Animated 90-Day Timeline with Professional Icons
function TimelineVisualization() {
  const milestones = [
    { day: 1, label: 'Foundation', color: PRIDE_COLORS.accent, icon: Flag },
    { day: 30, label: 'Development', color: PRIDE_COLORS.secondary, icon: Target },
    { day: 90, label: 'Mastery', color: PRIDE_COLORS.accent, icon: Crown },
  ];

  return (
    <div className="relative h-96 flex items-center justify-center">
      {/* Animated Timeline Line */}
      <svg viewBox="0 0 300 250" className="w-full h-full absolute inset-0">
        {/* Background Timeline Line */}
        <motion.line
          x1="20"
          y1="120"
          x2="280"
          y2="120"
          stroke={PRIDE_COLORS.border}
          strokeWidth="3"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />

        {/* Animated Progress Line */}
        <motion.line
          x1="20"
          y1="120"
          x2="280"
          y2="120"
          stroke={PRIDE_COLORS.accent}
          strokeWidth="3"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2, ease: 'easeInOut', delay: 0.2 }}
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
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                delay: idx * 0.3 + 0.3,
                type: 'spring',
                stiffness: 120,
                damping: 20,
              }}
            >
              {/* Outer Pulse Ring */}
              <motion.div
                className="absolute w-24 h-24 rounded-full"
                style={{
                  border: `2px solid ${milestone.color}`,
                  opacity: 0.3,
                }}
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: idx * 0.3 }}
              />

              {/* Icon Circle */}
              <motion.div
                className="relative w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl z-10 mb-8"
                style={{ backgroundColor: milestone.color }}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: idx * 0.2 }}
              >
                <IconComponent size={32} weight="bold" />
              </motion.div>

              {/* Labels */}
              <motion.div className="text-center mt-4" initial={{ opacity: 0, y: 10 }}>
                <div className="text-sm font-bold" style={{ color: milestone.color }}>
                  Day {milestone.day}
                </div>
                <div className="text-lg font-bold mt-1" style={{ color: PRIDE_COLORS.text }}>
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
// SECTION 2: MANAGER SECTION - Animated Metrics with Professional Icons
// ============================================================================
function ManagerSection() {
  const metrics = [
    {
      value: 40,
      label: 'Higher Retention',
      description: 'New hires stay longer',
      icon: ArrowUpRight,
    },
    {
      value: 60,
      label: 'Time Saved',
      description: 'Hours per hire',
      icon: Clock,
    },
    {
      value: 100,
      label: 'Team Participation',
      description: 'Real-time updates',
      icon: Users,
    },
  ];

  return (
    <section className="py-24 md:py-40 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          className="text-4xl md:text-6xl font-bold tracking-tight mb-20"
          style={{ color: PRIDE_COLORS.text }}
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          Real-Time Visibility Into Your Team's Growth
        </motion.h2>

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
                className="p-12 rounded-3xl border relative overflow-hidden group"
                style={{
                  borderColor: PRIDE_COLORS.border,
                  backgroundColor: PRIDE_COLORS.surface,
                }}
                variants={cascadeVariants}
                custom={idx}
                whileHover={{
                  y: -12,
                  boxShadow: `0 30px 60px rgba(220, 38, 38, 0.15)`,
                }}
              >
                {/* Animated Background Gradient on Hover */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(circle at 50% 50%, ${PRIDE_COLORS.accent}10, transparent)`,
                  }}
                  transition={{ duration: 0.3 }}
                />

                {/* Icon */}
                <motion.div
                  className="mb-8"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: idx * 0.2 }}
                >
                  <IconComponent size={48} color={PRIDE_COLORS.accent} weight="bold" />
                </motion.div>

                {/* Animated Counter */}
                <motion.div
                  className="text-6xl font-bold mb-4 relative z-10"
                  style={{ color: PRIDE_COLORS.accent }}
                >
                  <CounterAnimation value={metric.value} duration={2} />%
                </motion.div>

                <motion.div
                  className="text-xl font-semibold mb-3 relative z-10"
                  style={{ color: PRIDE_COLORS.text }}
                >
                  {metric.label}
                </motion.div>

                <motion.div
                  className="relative z-10"
                  style={{ color: PRIDE_COLORS.muted }}
                >
                  {metric.description}
                </motion.div>

                {/* Pulse Animation */}
                <motion.div
                  className="absolute bottom-4 right-4 w-2 h-2 rounded-full"
                  style={{ backgroundColor: PRIDE_COLORS.accent }}
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: idx * 0.3 }}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// SECTION 3: LEADS SECTION - Cascade Reveals with Spotlight Borders
// ============================================================================
function LeadsSection() {
  const features = [
    {
      title: 'Evaluate Anywhere',
      description: 'Rate skills on your phone during shifts. No waiting for meetings.',
      icon: Phone,
      large: true,
    },
    {
      title: 'See Real-Time Feedback',
      description: 'New hire sees your feedback instantly.',
      icon: ChatDots,
      large: false,
    },
    {
      title: 'Track What Matters',
      description: 'Technical, soft skills, leadership. All in one place.',
      icon: ChartBar,
      large: false,
    },
  ];

  return (
    <section className="py-24 md:py-40 bg-gradient-to-br from-emerald-50 to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          className="text-4xl md:text-6xl font-bold tracking-tight mb-20"
          style={{ color: PRIDE_COLORS.text }}
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          Feedback That Sticks. Progress You Can See.
        </motion.h2>

        {/* Asymmetric Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {/* Large Feature Card */}
          <motion.div
            className="md:col-span-2 p-12 md:p-14 rounded-3xl border bg-white relative overflow-hidden group"
            style={{ borderColor: PRIDE_COLORS.border }}
            custom={0}
            variants={cascadeVariants}
            whileHover={{
              boxShadow: `0 30px 60px rgba(220, 38, 38, 0.15)`,
              borderColor: PRIDE_COLORS.accent,
            }}
          >
            {/* Spotlight Border Animation */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
            >
              <motion.div
                className="absolute inset-0 rounded-3xl"
                style={{
                  background: `radial-gradient(circle 400px at var(--x) var(--y), ${PRIDE_COLORS.accent}20, transparent 80%)`,
                  '--x': '50%',
                  '--y': '50%',
                } as any}
                animate={{
                  '--x': ['20%', '80%', '20%'],
                  '--y': ['20%', '80%', '20%'],
                }}
                transition={{ duration: 4, repeat: Infinity }}
              />
            </motion.div>

            <motion.div
              className="relative z-10 flex items-start gap-8"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <div className="flex-shrink-0">
                <motion.div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${PRIDE_COLORS.accent}15` }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Phone size={40} color={PRIDE_COLORS.accent} weight="bold" />
                </motion.div>
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-bold mb-4" style={{ color: PRIDE_COLORS.text }}>
                  {features[0].title}
                </h3>
                <p className="text-lg" style={{ color: PRIDE_COLORS.muted }}>
                  {features[0].description}
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Small Feature Cards - Staggered */}
          <div className="flex flex-col gap-8">
            {features.slice(1).map((feature, idx) => {
              const IconComponent = feature.icon;

              return (
                <motion.div
                  key={idx}
                  className="p-10 rounded-2xl border bg-white relative overflow-hidden group"
                  style={{ borderColor: PRIDE_COLORS.border }}
                  custom={idx + 1}
                  variants={cascadeVariants}
                  whileHover={{
                    boxShadow: `0 20px 40px rgba(220, 38, 38, 0.1)`,
                    scale: 1.05,
                  }}
                >
                  {/* Gradient Background */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100"
                    style={{
                      background: `linear-gradient(135deg, ${PRIDE_COLORS.accent}05, transparent)`,
                    }}
                    transition={{ duration: 0.3 }}
                  />

                  <motion.div
                    className="relative z-10 flex items-start gap-4"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: idx * 0.2 }}
                  >
                    <div className="flex-shrink-0">
                      <motion.div
                        className="w-14 h-14 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${PRIDE_COLORS.accent}15` }}
                        animate={{ rotate: [0, 8, -8, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <IconComponent size={28} color={PRIDE_COLORS.accent} weight="bold" />
                      </motion.div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold mb-2 text-lg" style={{ color: PRIDE_COLORS.text }}>
                        {feature.title}
                      </h3>
                      <p className="text-sm" style={{ color: PRIDE_COLORS.muted }}>
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// SECTION 4: NEW HIRES - Sequential Milestone Animations with Icons
// ============================================================================
function NewHiresSection() {
  const milestones = [
    { phase: 'Days 1-30', title: 'Foundation', color: PRIDE_COLORS.accent, icon: Flag },
    {
      phase: 'Days 31-60',
      title: 'Development',
      color: PRIDE_COLORS.secondary,
      icon: Target,
    },
    { phase: 'Days 61-90', title: 'Mastery', color: PRIDE_COLORS.accent, icon: Crown },
  ];

  return (
    <section className="py-24 md:py-40 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          className="text-4xl md:text-6xl font-bold tracking-tight mb-20"
          style={{ color: PRIDE_COLORS.text }}
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          See Your Progress. Celebrate Your Growth.
        </motion.h2>

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
                className="relative p-12 rounded-3xl border text-center overflow-hidden group"
                style={{
                  borderColor: milestone.color,
                  backgroundColor: `${milestone.color}08`,
                }}
                custom={idx}
                variants={cascadeVariants}
                whileHover={{
                  scale: 1.08,
                  borderColor: milestone.color,
                  boxShadow: `0 20px 40px ${milestone.color}15`,
                }}
              >
                {/* Animated Background Glow */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(circle at 50% 50%, ${milestone.color}15, transparent 70%)`,
                  }}
                  transition={{ duration: 0.4 }}
                />

                {/* Icon Badge with Bounce */}
                <motion.div
                  className="relative z-10 w-24 h-24 mx-auto rounded-full mb-8 flex items-center justify-center text-white font-bold text-4xl"
                  style={{ backgroundColor: milestone.color }}
                  animate={{
                    y: [0, -16, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    delay: idx * 0.25,
                    ease: 'easeInOut',
                  }}
                >
                  <IconComponent size={48} weight="bold" />
                </motion.div>

                {/* Phase Label with Glow */}
                <motion.div
                  className="text-sm font-bold mb-3 relative z-10"
                  style={{ color: milestone.color }}
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  {milestone.phase}
                </motion.div>

                {/* Title */}
                <motion.h3
                  className="text-3xl font-bold relative z-10"
                  style={{ color: PRIDE_COLORS.text }}
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: idx * 0.2 }}
                >
                  {milestone.title}
                </motion.h3>

                {/* Pulse Ring */}
                <motion.div
                  className="absolute inset-0 rounded-3xl"
                  style={{
                    border: `2px solid ${milestone.color}`,
                    opacity: 0,
                  }}
                  animate={{ scale: [1, 1.1], opacity: [0.8, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: idx * 0.3,
                  }}
                />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Progress Indicator */}
        <motion.div className="mt-16 flex justify-center items-center gap-4">
          {milestones.map((_, idx) => (
            <motion.div
              key={idx}
              className="h-1 rounded-full"
              style={{ backgroundColor: milestones[idx].color }}
              animate={{
                width: ['0.5rem', '2rem', '0.5rem'],
              }}
              transition={{
                duration: 2,
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
// SECTION 5: SOCIAL PROOF - Carousel with Smooth Transitions & Icons
// ============================================================================
function SocialProofSection() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  const testimonials = [
    {
      quote: 'We went from spreadsheets to real-time insights. Game changer.',
      author: 'Marcus Chen',
      role: 'Manager, The Ritz-Carlton',
      location: '4-diamond hotel',
      rating: 5,
    },
    {
      quote: 'Our team sees growth they can actually track. Retention improved dramatically.',
      author: 'Sofia Rodriguez',
      role: 'Regional Director, Marriott',
      location: 'Multi-location chain',
      rating: 5,
    },
    {
      quote: 'PRIDE made evaluating new hires 60% faster. Best platform we have.',
      author: 'James Mitchell',
      role: 'Executive Chef, Peninsula',
      location: 'Fine dining group',
      rating: 5,
    },
  ];

  // Auto-advance carousel
  useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoPlay, testimonials.length]);

  return (
    <section className="py-24 md:py-40 bg-gradient-to-br from-amber-50 to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="text-center mb-20">
          <motion.h2
            className="text-4xl md:text-6xl font-bold tracking-tight mb-6"
            style={{ color: PRIDE_COLORS.text }}
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            Trusted by Leading Hospitality Teams
          </motion.h2>

          <motion.p
            className="text-xl"
            style={{ color: PRIDE_COLORS.muted }}
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            Join 50+ restaurants tracking 2,000+ new hires
          </motion.p>
        </motion.div>

        {/* Carousel */}
        <motion.div
          className="relative max-w-3xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          onMouseEnter={() => setAutoPlay(false)}
          onMouseLeave={() => setAutoPlay(true)}
        >
          {/* Testimonial Card */}
          <motion.div
            key={activeSlide}
            className="p-12 md:p-16 rounded-3xl border bg-white text-center relative overflow-hidden"
            style={{ borderColor: PRIDE_COLORS.border }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          >
            {/* Animated Background */}
            <motion.div
              className="absolute inset-0 opacity-5"
              style={{
                background: `radial-gradient(circle at 50% 50%, ${PRIDE_COLORS.accent}, transparent)`,
              }}
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            {/* Star Rating */}
            <motion.div
              className="flex justify-center gap-2 mb-8 relative z-10"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {Array.from({ length: testimonials[activeSlide].rating }).map((_, idx) => (
                <Star key={idx} size={24} color={PRIDE_COLORS.secondary} weight="fill" />
              ))}
            </motion.div>

            {/* Quote */}
            <motion.p
              className="text-2xl md:text-3xl font-medium mb-10 relative z-10 leading-relaxed"
              style={{ color: PRIDE_COLORS.text }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              "{testimonials[activeSlide].quote}"
            </motion.p>

            {/* Author Info */}
            <motion.div className="relative z-10" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <div className="font-bold text-lg" style={{ color: PRIDE_COLORS.accent }}>
                {testimonials[activeSlide].author}
              </div>
              <div className="text-sm mt-2" style={{ color: PRIDE_COLORS.muted }}>
                {testimonials[activeSlide].role}
              </div>
              <div className="text-sm" style={{ color: PRIDE_COLORS.muted }}>
                {testimonials[activeSlide].location}
              </div>
            </motion.div>
          </motion.div>

          {/* Carousel Controls */}
          <motion.div
            className="flex justify-center gap-3 mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {testimonials.map((_, idx) => (
              <motion.button
                key={idx}
                className="relative h-3 rounded-full transition-all overflow-hidden"
                style={{
                  width: idx === activeSlide ? '2rem' : '0.75rem',
                  backgroundColor: idx === activeSlide ? PRIDE_COLORS.accent : PRIDE_COLORS.border,
                }}
                onClick={() => {
                  setActiveSlide(idx);
                  setAutoPlay(false);
                }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.95 }}
              >
                {idx === activeSlide && (
                  <motion.div
                    className="absolute inset-0"
                    style={{ backgroundColor: PRIDE_COLORS.secondary }}
                    animate={{ x: ['100%', '-100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </motion.button>
            ))}
          </motion.div>

          {/* Progress Indicator */}
          <motion.div
            className="absolute -bottom-8 left-0 right-0 h-1 rounded-full"
            style={{ backgroundColor: PRIDE_COLORS.border }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: PRIDE_COLORS.accent }}
              animate={{ width: `${((activeSlide + 1) / testimonials.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// SECTION 6: CTA FOOTER - Gradient Animations & Text Reveals
// ============================================================================
function CTAFooterSection() {
  return (
    <section className="relative py-28 md:py-40 overflow-hidden">
      {/* Animated Gradient Background */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, #1a472a 0%, #2a5a3a 50%, #1a472a 100%)`,
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
      />

      {/* Animated Accent Blobs */}
      <motion.div
        className="absolute top-10 right-10 w-80 h-80 rounded-full opacity-20 blur-3xl"
        style={{ background: PRIDE_COLORS.accent }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <motion.div
        className="absolute bottom-0 left-10 w-96 h-96 rounded-full opacity-15 blur-3xl"
        style={{ background: PRIDE_COLORS.secondary }}
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 10, repeat: Infinity, delay: 1 }}
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Main Heading with Staggered Letters */}
        <motion.h2
          className="text-5xl md:text-7xl font-bold tracking-tight mb-10 text-white"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {['Transform', 'Your', 'Onboarding', 'in', '90', 'Days'].map((word, idx) => (
            <motion.span
              key={idx}
              variants={itemVariants}
              className="inline-block mr-4"
            >
              {word}
            </motion.span>
          ))}
        </motion.h2>

        {/* Subheading with Fade In */}
        <motion.p
          className="text-xl md:text-2xl mb-16 text-emerald-50 max-w-3xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <span style={{ color: PRIDE_COLORS.secondary }}>No credit card required.</span> Free trial
          includes 5 team members. Start seeing results today.
        </motion.p>

        {/* CTA Buttons with Advanced Animations */}
        <motion.div
          className="flex flex-col sm:flex-row justify-center gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Primary Button */}
          <motion.button
            className="px-12 py-5 rounded-full font-bold text-lg bg-white text-center relative overflow-hidden group flex items-center justify-center gap-3"
            style={{ color: PRIDE_COLORS.accent }}
            variants={itemVariants}
            whileHover={{ scale: 1.08, y: -4 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Shimmer Effect */}
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-30"
              style={{
                background: `linear-gradient(90deg, transparent, ${PRIDE_COLORS.secondary}, transparent)`,
              }}
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />

            <span className="relative flex items-center gap-2">
              Start Free Trial
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight size={24} weight="bold" />
              </motion.span>
            </span>
          </motion.button>

          {/* Secondary Button */}
          <motion.button
            className="px-12 py-5 rounded-full font-bold text-lg border-2 border-white text-white transition-all group relative overflow-hidden"
            style={{}}
            variants={itemVariants}
            whileHover={{
              scale: 1.08,
              y: -4,
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderColor: PRIDE_COLORS.secondary,
            }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Gradient Border Animation */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: `linear-gradient(90deg, ${PRIDE_COLORS.secondary}, ${PRIDE_COLORS.accent}, ${PRIDE_COLORS.secondary})`,
                backgroundSize: '200% 200%',
                opacity: 0,
              }}
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                opacity: [0, 0.3, 0],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            <span className="relative">Request a Demo</span>
          </motion.button>
        </motion.div>

        {/* Trust Badges with Icons */}
        <motion.div
          className="mt-16 flex flex-wrap justify-center gap-8 md:gap-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          {[
            { icon: CheckCircle, text: 'Free Setup' },
            { icon: Star, text: '24/7 Support' },
            { icon: Lightning, text: 'Instant Results' },
          ].map((badge, idx) => {
            const IconComponent = badge.icon;

            return (
              <motion.div
                key={idx}
                className="flex items-center gap-3 text-white"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: idx * 0.2 }}
              >
                <IconComponent size={24} weight="bold" color={PRIDE_COLORS.secondary} />
                <span className="font-semibold">{badge.text}</span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// MAIN LANDING PAGE EXPORT
// ============================================================================
export default function LandingPage() {
  return (
    <main className="overflow-hidden bg-white">
      <HeroSection />
      <ManagerSection />
      <LeadsSection />
      <NewHiresSection />
      <SocialProofSection />
      <CTAFooterSection />
    </main>
  );
}
