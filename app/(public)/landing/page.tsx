'use client';

import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle } from '@phosphor-icons/react';
import { useState } from 'react';

// ============================================================================
// PRIDE LANDING PAGE
// ============================================================================
// Energetic & bold landing page with 6 sections:
// 1. Hero Journey (90-day timeline)
// 2. Manager Section (ROI metrics)
// 3. Leads Section (3-column asymmetric features)
// 4. New Hires Section (30-60-90 milestones)
// 5. Social Proof (testimonials carousel)
// 6. CTA Footer

const PRIDE_COLORS = {
  accent: '#10b981', // Emerald Green
  secondary: '#f59e0b', // Warm Gold
  surface: '#f9fafb', // Off-White
  text: '#18181b', // Zinc-950
  muted: '#71717a', // Zinc-600
  border: '#e4e4e7', // Zinc-200
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 20 },
  },
};

// ============================================================================
// SECTION 1: HERO - 90-Day Journey
// ============================================================================
function HeroSection() {
  return (
    <section className="relative min-h-[100dvh] overflow-hidden bg-gradient-to-br from-white via-emerald-50/30 to-amber-50/30">
      {/* Background Gradient Blob Animation */}
      <motion.div
        className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20"
        style={{ background: `linear-gradient(135deg, ${PRIDE_COLORS.accent}, ${PRIDE_COLORS.secondary})` }}
        animate={{
          y: [0, 30, 0],
          x: [0, 20, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {/* Left: Hero Text (Asymmetric - Left Aligned) */}
          <motion.div className="order-2 md:order-1" variants={itemVariants}>
            <motion.h1
              className="text-4xl md:text-6xl font-bold tracking-tighter leading-none mb-6"
              style={{ color: PRIDE_COLORS.text }}
            >
              Transform Your Onboarding in{' '}
              <span style={{ color: PRIDE_COLORS.accent }}>90 Days</span>
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl mb-8 leading-relaxed max-w-[65ch]"
              style={{ color: PRIDE_COLORS.muted }}
              variants={itemVariants}
            >
              Real-time evaluations. Measurable growth. One platform.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              variants={itemVariants}
            >
              <motion.button
                className="px-8 py-3 rounded-full font-semibold text-white transition-all hover:scale-105 active:scale-98"
                style={{ backgroundColor: PRIDE_COLORS.accent }}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
              >
                Start Free Trial
              </motion.button>
              <motion.button
                className="px-8 py-3 rounded-full font-semibold border-2 transition-all hover:scale-105 active:scale-98"
                style={{
                  color: PRIDE_COLORS.accent,
                  borderColor: PRIDE_COLORS.accent,
                }}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
              >
                Request Demo
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Right: Hero Visual (90-Day Timeline Animation) */}
          <motion.div className="order-1 md:order-2" variants={itemVariants}>
            <TimelineVisualization />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// Animated 90-Day Timeline
function TimelineVisualization() {
  const milestones = [
    { day: 1, label: 'Foundation', color: PRIDE_COLORS.accent },
    { day: 30, label: 'Development', color: PRIDE_COLORS.secondary },
    { day: 90, label: 'Mastery', color: PRIDE_COLORS.accent },
  ];

  return (
    <div className="relative h-80 flex items-center justify-center">
      <svg viewBox="0 0 300 200" className="w-full h-full">
        {/* Timeline Line */}
        <line x1="20" y1="100" x2="280" y2="100" stroke={PRIDE_COLORS.border} strokeWidth="2" />

        {/* Milestone Circles */}
        {milestones.map((milestone, idx) => (
          <motion.g
            key={idx}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.3, type: 'spring', stiffness: 100 }}
          >
            <circle
              cx={20 + (idx * 130)}
              cy="100"
              r="16"
              fill={milestone.color}
              opacity="0.2"
            />
            <circle
              cx={20 + (idx * 130)}
              cy="100"
              r="10"
              fill={milestone.color}
            />
            <text
              x={20 + (idx * 130)}
              y="140"
              textAnchor="middle"
              fill={PRIDE_COLORS.text}
              fontSize="12"
              fontWeight="600"
            >
              Day {milestone.day}
            </text>
            <text
              x={20 + (idx * 130)}
              y="160"
              textAnchor="middle"
              fill={PRIDE_COLORS.muted}
              fontSize="11"
            >
              {milestone.label}
            </text>
          </motion.g>
        ))}
      </svg>

      {/* Animated Progress Indicator */}
      <motion.div
        className="absolute top-1/2 left-0 h-1 rounded-full"
        style={{
          width: '30%',
          backgroundColor: PRIDE_COLORS.accent,
          transform: 'translateY(-50%)',
        }}
        animate={{ width: ['0%', '100%'] }}
        transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
      />
    </div>
  );
}

// ============================================================================
// SECTION 2: MANAGER SECTION - ROI Metrics
// ============================================================================
function ManagerSection() {
  const metrics = [
    { value: '40%', label: 'Higher Retention', description: 'New hires stay longer' },
    { value: '60%', label: 'Time Saved', description: 'Hours per hire' },
    { value: '100%', label: 'Team Participation', description: 'Real-time updates' },
  ];

  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          className="text-3xl md:text-5xl font-bold tracking-tight mb-16"
          style={{ color: PRIDE_COLORS.text }}
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          Real-Time Visibility Into Your Team's Growth
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {metrics.map((metric, idx) => (
            <motion.div
              key={idx}
              className="p-8 rounded-2xl border"
              style={{ borderColor: PRIDE_COLORS.border, backgroundColor: PRIDE_COLORS.surface }}
              variants={itemVariants}
              whileHover={{ y: -8, boxShadow: `0 20px 40px rgba(16, 185, 129, 0.1)` }}
            >
              <motion.div
                className="text-5xl font-bold mb-2"
                style={{ color: PRIDE_COLORS.accent }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: idx * 0.2 }}
              >
                {metric.value}
              </motion.div>
              <div className="text-lg font-semibold mb-2" style={{ color: PRIDE_COLORS.text }}>
                {metric.label}
              </div>
              <div style={{ color: PRIDE_COLORS.muted }}>{metric.description}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// SECTION 3: LEADS SECTION - 3-Column Asymmetric Features
// ============================================================================
function LeadsSection() {
  const features = [
    {
      title: 'Evaluate Anywhere',
      description: 'Rate skills on your phone during shifts. No waiting for meetings.',
      icon: '📱',
    },
    {
      title: 'See Real-Time Feedback',
      description: 'New hire sees your feedback instantly.',
      icon: '✓',
    },
    {
      title: 'Track What Matters',
      description: 'Technical, soft skills, leadership. All in one place.',
      icon: '📊',
    },
  ];

  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-emerald-50 to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          className="text-3xl md:text-5xl font-bold tracking-tight mb-16"
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
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {/* Large Feature Card */}
          <motion.div
            className="md:col-span-2 p-8 md:p-10 rounded-3xl border bg-white"
            style={{ borderColor: PRIDE_COLORS.border }}
            variants={itemVariants}
            whileHover={{ boxShadow: `0 20px 40px rgba(16, 185, 129, 0.15)` }}
          >
            <div
              className="text-4xl mb-4"
              role="img"
              aria-label={features[0].title}
            >
              {features[0].icon}
            </div>
            <h3 className="text-2xl font-bold mb-3" style={{ color: PRIDE_COLORS.text }}>
              {features[0].title}
            </h3>
            <p style={{ color: PRIDE_COLORS.muted }}>{features[0].description}</p>
          </motion.div>

          {/* Small Feature Cards */}
          <div className="flex flex-col gap-6">
            {features.slice(1).map((feature, idx) => (
              <motion.div
                key={idx}
                className="p-6 rounded-2xl border bg-white"
                style={{ borderColor: PRIDE_COLORS.border }}
                variants={itemVariants}
                whileHover={{ boxShadow: `0 12px 24px rgba(16, 185, 129, 0.1)` }}
              >
                <div className="text-3xl mb-2" role="img" aria-label={feature.title}>
                  {feature.icon}
                </div>
                <h3 className="font-bold mb-1" style={{ color: PRIDE_COLORS.text }}>
                  {feature.title}
                </h3>
                <p className="text-sm" style={{ color: PRIDE_COLORS.muted }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// SECTION 4: NEW HIRES - 30-60-90 Milestones
// ============================================================================
function NewHiresSection() {
  const milestones = [
    { phase: 'Days 1-30', title: 'Foundation', color: PRIDE_COLORS.accent },
    { phase: 'Days 31-60', title: 'Development', color: PRIDE_COLORS.secondary },
    { phase: 'Days 61-90', title: 'Mastery', color: PRIDE_COLORS.accent },
  ];

  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          className="text-3xl md:text-5xl font-bold tracking-tight mb-16"
          style={{ color: PRIDE_COLORS.text }}
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          See Your Progress. Celebrate Your Growth.
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {milestones.map((milestone, idx) => (
            <motion.div
              key={idx}
              className="p-8 rounded-2xl border text-center"
              style={{
                borderColor: milestone.color,
                backgroundColor: `${milestone.color}08`,
              }}
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="w-16 h-16 mx-auto rounded-full mb-6 flex items-center justify-center text-white font-bold text-2xl"
                style={{ backgroundColor: milestone.color }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: idx * 0.3 }}
              >
                {idx + 1}
              </motion.div>
              <div className="text-sm font-semibold mb-2" style={{ color: milestone.color }}>
                {milestone.phase}
              </div>
              <h3 className="text-2xl font-bold" style={{ color: PRIDE_COLORS.text }}>
                {milestone.title}
              </h3>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// SECTION 5: SOCIAL PROOF - Testimonials Carousel
// ============================================================================
function SocialProofSection() {
  const [activeSlide, setActiveSlide] = useState(0);

  const testimonials = [
    {
      quote: 'We went from spreadsheets to real-time insights. Game changer.',
      author: 'Marcus Chen',
      role: 'Manager, The Ritz-Carlton',
      location: '4-diamond hotel',
    },
    {
      quote: 'Our team sees growth they can actually track. Retention improved dramatically.',
      author: 'Sofia Rodriguez',
      role: 'Regional Director, Marriott',
      location: 'Multi-location chain',
    },
    {
      quote: 'PRIDE made evaluating new hires 60% faster. Best platform we have.',
      author: 'James Mitchell',
      role: 'Executive Chef, Peninsula',
      location: 'Fine dining group',
    },
  ];

  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-amber-50 to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-center"
          style={{ color: PRIDE_COLORS.text }}
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          Trusted by Leading Hospitality Teams
        </motion.h2>

        <motion.p
          className="text-center text-lg mb-16"
          style={{ color: PRIDE_COLORS.muted }}
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          Join 50+ restaurants tracking 2,000+ new hires
        </motion.p>

        {/* Carousel */}
        <motion.div
          className="relative max-w-2xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div
            key={activeSlide}
            className="p-8 md:p-12 rounded-3xl border bg-white text-center"
            style={{ borderColor: PRIDE_COLORS.border }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          >
            <p className="text-lg md:text-2xl font-medium mb-6" style={{ color: PRIDE_COLORS.text }}>
              "{testimonials[activeSlide].quote}"
            </p>
            <div className="font-semibold" style={{ color: PRIDE_COLORS.accent }}>
              {testimonials[activeSlide].author}
            </div>
            <div className="text-sm" style={{ color: PRIDE_COLORS.muted }}>
              {testimonials[activeSlide].role}
            </div>
            <div className="text-sm" style={{ color: PRIDE_COLORS.muted }}>
              {testimonials[activeSlide].location}
            </div>
          </motion.div>

          {/* Carousel Controls */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, idx) => (
              <motion.button
                key={idx}
                className="w-3 h-3 rounded-full transition-all"
                style={{
                  backgroundColor: idx === activeSlide ? PRIDE_COLORS.accent : PRIDE_COLORS.border,
                }}
                onClick={() => setActiveSlide(idx)}
                whileHover={{ scale: 1.2 }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// SECTION 6: CTA FOOTER
// ============================================================================
function CTAFooterSection() {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-emerald-900 to-emerald-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2
          className="text-4xl md:text-6xl font-bold tracking-tight mb-8 text-white"
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          Transform Your Onboarding in 90 Days
        </motion.h2>

        <motion.p
          className="text-lg md:text-xl mb-12 text-emerald-100"
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          No credit card required. Free trial includes 5 team members.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row justify-center gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.button
            className="px-10 py-4 rounded-full font-bold text-lg bg-white transition-all hover:scale-105 active:scale-98 flex items-center justify-center gap-2"
            style={{ color: PRIDE_COLORS.accent }}
            variants={itemVariants}
            whileHover={{ y: -3 }}
            whileTap={{ y: 0 }}
          >
            Start Free Trial
            <ArrowRight size={20} weight="bold" />
          </motion.button>

          <motion.button
            className="px-10 py-4 rounded-full font-bold text-lg border-2 border-white text-white transition-all hover:scale-105 active:scale-98"
            variants={itemVariants}
            whileHover={{ y: -3, backgroundColor: 'rgba(255,255,255,0.1)' }}
            whileTap={{ y: 0 }}
          >
            Request a Demo
          </motion.button>
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
