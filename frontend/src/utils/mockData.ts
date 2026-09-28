import { NewHire, Skill, SoftSkill, LeadershipModule, AnalyticsResponse, UserPreferences, UserSettings } from '../types/index'

const today = new Date()
const threeMonthsAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000)

// FOH Skills (7 total)
export const fohSkills: Skill[] = [
  {
    id: 'foh-1',
    name: 'Menu Knowledge',
    description: 'Understanding of menu items, ingredients, and preparation methods',
  },
  {
    id: 'foh-2',
    name: 'Hospitality Standards',
    description: 'Delivering excellent customer service and maintaining professional demeanor',
  },
  {
    id: 'foh-3',
    name: 'Cash/Payment Handling',
    description: 'Accurate processing of payments and cash management',
  },
  {
    id: 'foh-4',
    name: 'POS System Proficiency',
    description: 'Competency with point-of-sale system and order entry',
  },
  {
    id: 'foh-5',
    name: 'Table Management',
    description: 'Efficient table turnovers and guest flow management',
  },
  {
    id: 'foh-6',
    name: 'Upselling',
    description: 'Suggesting additional items and premium offerings',
  },
  {
    id: 'foh-7',
    name: 'Shift Readiness',
    description: 'Punctuality, preparedness, and shift setup',
  },
]

// BOH Skills (8 total)
export const bohSkills: Skill[] = [
  {
    id: 'boh-1',
    name: 'Food Safety & Sanitation',
    description: 'Knowledge of food handling protocols and kitchen hygiene standards',
  },
  {
    id: 'boh-2',
    name: 'Knife Skills',
    description: 'Proper and efficient knife handling and cutting techniques',
  },
  {
    id: 'boh-3',
    name: 'Recipe Knowledge',
    description: 'Understanding of recipes, measurements, and cooking techniques',
  },
  {
    id: 'boh-4',
    name: 'Equipment Operation',
    description: 'Safe and proficient use of kitchen equipment and tools',
  },
  {
    id: 'boh-5',
    name: 'Plating & Presentation',
    description: 'Attention to detail in dish presentation and consistency',
  },
  {
    id: 'boh-6',
    name: 'Kitchen Safety',
    description: 'Adherence to safety protocols and hazard awareness',
  },
  {
    id: 'boh-7',
    name: 'Inventory Management',
    description: 'Tracking and managing food and supply inventory',
  },
  {
    id: 'boh-8',
    name: 'Collaboration with FOH',
    description: 'Communication and teamwork between kitchen and service staff',
  },
]

export const mockNewHires: NewHire[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Server',
    department: 'FOH',
    start_date: threeMonthsAgo.toISOString().split('T')[0],
    day_90_target_date: today.toISOString().split('T')[0],
    status: 'active',
    completion_percent: 85,
    days_elapsed: 87,
  },
  {
    id: '2',
    name: 'Marcus Chen',
    role: 'Line Cook',
    department: 'BOH',
    start_date: new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    day_90_target_date: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'active',
    completion_percent: 65,
    days_elapsed: 60,
  },
  {
    id: '3',
    name: 'Emma Rodriguez',
    role: 'Hostess',
    department: 'FOH',
    start_date: new Date(today.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    day_90_target_date: new Date(today.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'active',
    completion_percent: 45,
    days_elapsed: 45,
  },
  {
    id: '4',
    name: 'James Patterson',
    role: 'Prep Cook',
    department: 'BOH',
    start_date: new Date(today.getTime() - 75 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    day_90_target_date: new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'active',
    completion_percent: 72,
    days_elapsed: 75,
  },
  {
    id: '5',
    name: 'Lisa Wong',
    role: 'Busser',
    department: 'FOH',
    start_date: new Date(today.getTime() - 95 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    day_90_target_date: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'completed',
    completion_percent: 100,
    days_elapsed: 95,
  },
  {
    id: '6',
    name: 'David Kim',
    role: 'Head Chef',
    department: 'BOH',
    start_date: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    day_90_target_date: new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'on-hold',
    completion_percent: 25,
    days_elapsed: 30,
  },
  {
    id: '7',
    name: 'Angela Martinez',
    role: 'Server',
    department: 'FOH',
    start_date: new Date(today.getTime() - 40 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    day_90_target_date: new Date(today.getTime() + 50 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'active',
    completion_percent: 38,
    days_elapsed: 40,
  },
  {
    id: '8',
    name: 'Thomas Anderson',
    role: 'Bartender',
    department: 'FOH',
    start_date: new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    day_90_target_date: new Date(today.getTime() + 70 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'active',
    completion_percent: 15,
    days_elapsed: 20,
  },
]

// Soft Skills (10 total - verbatim from requirements)
export const softSkills: SoftSkill[] = [
  {
    id: 'soft-1',
    name: 'Guest Engagement & Hospitality Mindset',
    description: 'Ability to engage with guests in a warm, welcoming manner with genuine hospitality',
  },
  {
    id: 'soft-2',
    name: 'Communication Clarity',
    description: 'Clear and effective communication with team members and guests',
  },
  {
    id: 'soft-3',
    name: 'Adaptability',
    description: 'Ability to adjust to changing circumstances and handle unexpected situations',
  },
  {
    id: 'soft-4',
    name: 'Teamwork/Collaboration',
    description: 'Works effectively with others to achieve common goals',
  },
  {
    id: 'soft-5',
    name: 'Conflict Resolution',
    description: 'Ability to address and resolve conflicts constructively',
  },
  {
    id: 'soft-6',
    name: 'Time Management',
    description: 'Prioritizes tasks and manages time efficiently',
  },
  {
    id: 'soft-7',
    name: 'Attention to Detail',
    description: 'Notices and addresses details in work and customer service',
  },
  {
    id: 'soft-8',
    name: 'Positive Attitude/Resilience',
    description: 'Maintains positive demeanor and recovers well from setbacks',
  },
  {
    id: 'soft-9',
    name: 'Active Listening',
    description: 'Fully engages when listening to guests and team members',
  },
  {
    id: 'soft-10',
    name: 'Professionalism/Appearance',
    description: 'Maintains professional standards in appearance and conduct',
  },
]

// Leadership Modules - Thirty Percent Framework (8 total - verbatim from requirements)
export const leadershipModules: LeadershipModule[] = [
  {
    id: 'lead-1',
    name: 'Leadership Mindset',
    description: 'Foundation of leadership thinking and vision setting',
    days: '21-35',
  },
  {
    id: 'lead-2',
    name: 'Emotional Intelligence',
    description: 'Understanding and managing emotions in self and others',
    days: '21-35',
  },
  {
    id: 'lead-3',
    name: 'Time & Priorities',
    description: 'Strategic time management and priority setting',
    days: '36-50',
  },
  {
    id: 'lead-4',
    name: 'Clear Communication',
    description: 'Communicating vision and expectations clearly to the team',
    days: '36-50',
  },
  {
    id: 'lead-5',
    name: 'Motivation',
    description: 'Inspiring and motivating team members',
    days: '51-65',
  },
  {
    id: 'lead-6',
    name: 'Accountability',
    description: 'Creating accountability and ownership within the team',
    days: '51-65',
  },
  {
    id: 'lead-7',
    name: 'Conflict Resolution',
    description: 'Managing team conflicts and difficult conversations',
    days: '66-80',
  },
  {
    id: 'lead-8',
    name: 'Thriving in the Rush',
    description: 'Leading effectively during high-pressure service periods',
    days: '81-90',
  },
]

// Mock Analytics Data
const generateMockAnalytics = (newHireId: string, daysElapsed: number, name: string): AnalyticsResponse => {
  // Generate realistic daily progress (S-curve: slow start, rapid growth, plateau)
  const dailyProgress = Array.from({ length: Math.min(daysElapsed, 7) }, (_, i) => {
    const day = daysElapsed - (7 - i - 1)
    const progressPercent = Math.min(100, (day / 90) * 100 + (Math.random() * 10 - 5))
    return {
      day,
      date: new Date(today.getTime() - (7 - i - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      progressPercent: Math.max(0, Math.min(100, progressPercent)),
    }
  })

  // Generate skill proficiencies (0-5 scale)
  const allSkills = [...fohSkills, ...bohSkills]
  const skillProficiencies = allSkills.map((skill) => ({
    skillId: skill.id,
    skillName: skill.name,
    proficiency: Math.min(5, Math.max(1, (daysElapsed / 90) * 5 + (Math.random() * 2 - 1))),
  }))

  // Score calculation based on days elapsed
  const baseScore = Math.min(5, (daysElapsed / 90) * 5)
  const technicalScore = baseScore + (Math.random() * 0.8 - 0.4)
  const softSkillScore = baseScore + (Math.random() * 0.8 - 0.4)
  const leadershipScore = Math.min(5, Math.max(0, baseScore - 0.5 + (Math.random() * 0.8 - 0.4)))

  // Cohort comparison
  const cohortAvgTechnical = baseScore - 0.3
  const cohortAvgSoft = baseScore - 0.2
  const cohortAvgLeadership = baseScore - 0.5

  const completionPercent = (daysElapsed / 90) * 100
  const cohortPercentile = Math.min(100, Math.max(0, 50 + (daysElapsed - 45) + (Math.random() * 20 - 10)))

  // Milestones
  const milestones = [
    { day: 7, label: 'Week 1 Complete', completed: daysElapsed >= 7 },
    { day: 30, label: '30-Day Check-in', completed: daysElapsed >= 30 },
    { day: 60, label: 'Mid-point Review', completed: daysElapsed >= 60 },
    { day: 90, label: 'Training Complete', completed: daysElapsed >= 90 },
  ]

  const skillsAverage = skillProficiencies.reduce((sum, s) => sum + s.proficiency, 0) / skillProficiencies.length

  return {
    newHireId,
    newHireName: name,
    daysElapsed,
    daysTotal: 90,
    completionPercent: Math.min(100, completionPercent),
    skillProficiencies,
    technicalScore: Math.min(5, Math.max(0, technicalScore)),
    softSkillScore: Math.min(5, Math.max(0, softSkillScore)),
    leadershipScore: Math.min(5, Math.max(0, leadershipScore)),
    dailyProgress,
    cohortPercentile,
    cohortComparison: [
      { label: 'Technical Skills', userScore: technicalScore, cohortAverage: cohortAvgTechnical },
      { label: 'Soft Skills', userScore: softSkillScore, cohortAverage: cohortAvgSoft },
      { label: 'Leadership', userScore: leadershipScore, cohortAverage: cohortAvgLeadership },
    ],
    milestones,
    skillsAverage: Math.min(5, Math.max(0, skillsAverage)),
  }
}

export const mockAnalytics = {
  '1': generateMockAnalytics('1', 87, 'Sarah Johnson'),
  '2': generateMockAnalytics('2', 60, 'Marcus Chen'),
  '3': generateMockAnalytics('3', 45, 'Emma Rodriguez'),
  '4': generateMockAnalytics('4', 75, 'James Patterson'),
  '5': generateMockAnalytics('5', 95, 'Lisa Wong'),
  '6': generateMockAnalytics('6', 30, 'David Kim'),
  '7': generateMockAnalytics('7', 40, 'Angela Martinez'),
  '8': generateMockAnalytics('8', 20, 'Thomas Anderson'),
}

export const getMockAnalytics = (newHireId: string): AnalyticsResponse | null => {
  return mockAnalytics[newHireId as keyof typeof mockAnalytics] || null
}

// Default user preferences
export const defaultUserPreferences: UserPreferences = {
  pushNotificationsEnabled: true,
  reminderFrequency: 'weekly',
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  themeMode: 'system',
}

// Mock user settings
export const mockUserSettings: UserSettings = {
  userId: 'user-001',
  name: 'John Manager',
  email: 'john.manager@pridetraining.com',
  role: 'manager',
  team: 'FOH Team',
  preferences: defaultUserPreferences,
}

// Mock user with admin role
export const mockAdminSettings: UserSettings = {
  userId: 'admin-001',
  name: 'Sarah Admin',
  email: 'sarah.admin@pridetraining.com',
  role: 'admin',
  team: 'Management',
  preferences: {
    ...defaultUserPreferences,
    themeMode: 'dark',
  },
}
