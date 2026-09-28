export type Department = 'FOH' | 'BOH'
export type NewHireStatus = 'active' | 'on-hold' | 'completed'
export type StatusType = 'on-track' | 'behind' | 'at-risk'
export type EvaluationTab = 'skills' | 'soft-skills' | 'leadership' | 'strengths' | 'areas' | 'notes'
export type UserRole = 'new_hire' | 'manager' | 'asst_manager' | 'admin' | 'lead' | 'staff'
export type SettingsTab = 'profile' | 'preferences' | 'about'
export type ThemeMode = 'light' | 'dark' | 'system'

// User preferences and settings
export interface UserPreferences {
  pushNotificationsEnabled: boolean
  reminderFrequency: 'daily' | 'weekly' | 'none'
  quietHoursEnabled: boolean
  quietHoursStart: string // HH:mm format
  quietHoursEnd: string // HH:mm format
  themeMode: ThemeMode
}

export interface UserSettings {
  userId: string
  name: string
  email: string
  role: UserRole
  team?: string
  preferences: UserPreferences
}

export interface NewHire {
  id: string
  name: string
  role: string
  department: Department
  start_date: string
  day_90_target_date: string
  status: NewHireStatus
  completion_percent: number
  days_elapsed: number
}

export interface FilterOptions {
  department: Department | 'all'
  status: NewHireStatus | 'all'
  searchQuery: string
  sortBy: 'start_date' | 'completion_percent'
  sortOrder: 'asc' | 'desc'
}

export interface Skill {
  id: string
  name: string
  description: string
}

export interface SkillRating {
  skillId: string
  rating: number | null // 1-5 or null if not rated
  notes: string
}

export interface SoftSkill {
  id: string
  name: string
  description: string
}

export interface LeadershipModule {
  id: string
  name: string
  description: string
  days: string // e.g., "21-35"
}

export interface LeadershipReflection {
  moduleId: string
  completed: boolean
  completedDate?: string // ISO date string when marked complete
  notes: string
}

export interface EvaluationFormData {
  newHireId: string
  evaluatorId: string
  skillsRatings: SkillRating[]
  softSkillsRatings: SkillRating[]
  leadershipReflections: LeadershipReflection[]
  strengths: string
  areasForImprovement: string
  overallNotes: string
  saveState: 'idle' | 'saving' | 'saved'
  lastSavedAt?: string
}

// Analytics types
export interface SkillProficiency {
  skillId: string
  skillName: string
  proficiency: number // 0-5
}

export interface DailyProgress {
  day: number
  date: string
  progressPercent: number
}

export interface CohortMetric {
  label: string
  userScore: number
  cohortAverage: number
}

export interface Milestone {
  day: number
  label: string
  completed: boolean
}

export interface AnalyticsResponse {
  newHireId: string
  newHireName: string
  daysElapsed: number
  daysTotal: number
  completionPercent: number
  skillProficiencies: SkillProficiency[]
  technicalScore: number // 0-5
  softSkillScore: number // 0-5
  leadershipScore: number // 0-5
  dailyProgress: DailyProgress[]
  cohortPercentile: number // 0-100
  cohortComparison: CohortMetric[]
  milestones: Milestone[]
  skillsAverage: number // 0-5
}
