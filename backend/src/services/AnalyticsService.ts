import { Pool } from 'pg';

export interface SkillProgress {
  skill_id: string;
  skill_type: string;
  current_rating: number;
  last_updated: Date;
  trend: 'up' | 'down' | 'stable';
}

export interface AnalyticsData {
  new_hire_id: string;
  days_elapsed: number;
  days_remaining: number;
  completion_percentage: number;
  technical_skills_avg: number;
  soft_skills_avg: number;
  leadership_modules_complete: number;
  skill_progress: SkillProgress[];
  weekly_trend: Array<{ week: number; avg_rating: number }>;
  cohort_comparison: {
    user_percentile: number;
    peer_average: number;
  };
}

export interface CohortMember {
  id: string;
  name: string;
  avg_rating: number;
  rank: number;
}

export class AnalyticsService {
  constructor(private pool: Pool) {}

  async getNewHireAnalytics(newHireId: string): Promise<AnalyticsData> {
    // Fetch new hire start date
    const nhResult = await this.pool.query(
      'SELECT start_date FROM new_hires WHERE id = $1 AND is_active = true',
      [newHireId]
    );
    if (nhResult.rows.length === 0) throw new Error('New hire not found');

    const startDate = new Date(nhResult.rows[0].start_date);
    const today = new Date();
    const daysElapsed = Math.floor(
      (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysRemaining = Math.max(0, 90 - daysElapsed);
    const completionPercentage = Math.min(100, (daysElapsed / 90) * 100);

    // Fetch skill ratings - deduplicate by skill, keeping latest rating only
    // Use DISTINCT ON to get only the most recent assessment per skill
    const skillsResult = await this.pool.query(
      `SELECT DISTINCT ON (skill_id, skill_type)
        skill_id,
        skill_type,
        proficiency_level,
        CASE proficiency_level
          WHEN 'novice' THEN 1
          WHEN 'beginner' THEN 2
          WHEN 'intermediate' THEN 3
          WHEN 'advanced' THEN 4
          WHEN 'expert' THEN 5
          ELSE 3
        END as rating,
        updated_at
       FROM skill_assessments
       WHERE new_hire_id = $1
       ORDER BY skill_id, skill_type, updated_at DESC`,
      [newHireId]
    );

    // Normalize skill_type from DB ('soft' -> 'soft_skill')
    const normalizedSkills = skillsResult.rows.map(r => ({
      ...r,
      skill_type: r.skill_type === 'soft' ? 'soft_skill' : r.skill_type
    }));

    const technicalSkills = normalizedSkills.filter(r => r.skill_type === 'technical');
    const softSkills = normalizedSkills.filter(r => r.skill_type === 'soft_skill');

    const technicalAvg =
      technicalSkills.length > 0
        ? parseFloat(
            (
              technicalSkills.reduce((sum, r) => sum + r.rating, 0) /
              technicalSkills.length
            ).toFixed(2)
          )
        : 0;

    const softAvg =
      softSkills.length > 0
        ? parseFloat(
            (
              softSkills.reduce((sum, r) => sum + r.rating, 0) / softSkills.length
            ).toFixed(2)
          )
        : 0;

    // Fetch leadership module completions
    const modulesResult = await this.pool.query(
      `SELECT COUNT(*) as complete FROM leadership_progress
       WHERE new_hire_id = $1 AND status = 'completed'`,
      [newHireId]
    );
    const modulesComplete = parseInt(modulesResult.rows[0].complete, 10);

    // Weekly trend - aggregate ratings by week since start_date
    const weeklyResult = await this.pool.query(
      `SELECT
        FLOOR(EXTRACT(EPOCH FROM (updated_at - $1)) / (7 * 24 * 60 * 60)) as week_num,
        AVG(CASE proficiency_level
          WHEN 'novice' THEN 1
          WHEN 'beginner' THEN 2
          WHEN 'intermediate' THEN 3
          WHEN 'advanced' THEN 4
          WHEN 'expert' THEN 5
          ELSE 3
        END) as avg_rating
       FROM skill_assessments
       WHERE new_hire_id = $2
       GROUP BY week_num
       ORDER BY week_num`,
      [startDate, newHireId]
    );

    const weeklyTrend = weeklyResult.rows.map(r => ({
      week: Math.max(0, Math.floor(parseFloat(r.week_num))),
      avg_rating: parseFloat(parseFloat(r.avg_rating).toFixed(2))
    }));

    // Cohort comparison - get all new hires of same department and compare rankings
    const cohortResult = await this.pool.query(
      `SELECT
        nh.id,
        nh.department,
        COALESCE(AVG(CASE sa.proficiency_level
          WHEN 'novice' THEN 1
          WHEN 'beginner' THEN 2
          WHEN 'intermediate' THEN 3
          WHEN 'advanced' THEN 4
          WHEN 'expert' THEN 5
          ELSE NULL
        END), 0) as avg_rating
       FROM new_hires nh
       LEFT JOIN skill_assessments sa ON nh.id = sa.new_hire_id
       WHERE nh.department = (SELECT department FROM new_hires WHERE id = $1)
         AND nh.is_active = true
       GROUP BY nh.id, nh.department
       ORDER BY avg_rating DESC`,
      [newHireId]
    );

    // Calculate percentile and peer average
    // CRITICAL FIX: PostgreSQL AVG() returns NUMERIC as strings, must convert to numbers
    const userResult = cohortResult.rows.find(r => r.id === newHireId);
    const userAverage = userResult ? parseFloat(userResult.avg_rating) : 0;

    // CRITICAL FIX: Exclude the user themselves from peer calculations
    // Percentile should be rank among PEERS, not among self + peers
    const peerAverages = cohortResult.rows
      .filter(r => r.id !== newHireId)
      .map(r => parseFloat(r.avg_rating));

    // Calculate how many peers scored lower than this user
    const betterThanCount = peerAverages.filter(avg => avg < userAverage).length;
    const userPercentile = peerAverages.length > 0
      ? Math.round((betterThanCount / peerAverages.length) * 100)
      : 0;

    // Fixed: peer_average also excludes the user (true peer average, not self + peers)
    const peerAverage = peerAverages.length > 0
      ? Math.round(
          (peerAverages.reduce((a, b) => a + b, 0) / peerAverages.length) * 100
        ) / 100
      : 0;

    return {
      new_hire_id: newHireId,
      days_elapsed: daysElapsed,
      days_remaining: daysRemaining,
      completion_percentage: parseFloat(completionPercentage.toFixed(2)),
      technical_skills_avg: technicalAvg,
      soft_skills_avg: softAvg,
      leadership_modules_complete: modulesComplete,
      skill_progress: normalizedSkills.map(r => ({
        skill_id: r.skill_id,
        skill_type: r.skill_type,
        current_rating: r.rating,
        last_updated: r.updated_at,
        trend: 'stable' // Simplified: would need historical comparison for real trend
      })),
      weekly_trend: weeklyTrend,
      cohort_comparison: {
        user_percentile: userPercentile,
        peer_average: peerAverage
      }
    };
  }

  async getCohortAnalytics(
    department: 'FOH' | 'BOH'
  ): Promise<CohortMember[]> {
    // Fetch all new hires of given department with their average ratings
    const result = await this.pool.query(
      `SELECT
        nh.id,
        nh.user_id,
        COALESCE(AVG(CASE sa.proficiency_level
          WHEN 'novice' THEN 1
          WHEN 'beginner' THEN 2
          WHEN 'intermediate' THEN 3
          WHEN 'advanced' THEN 4
          WHEN 'expert' THEN 5
          ELSE NULL
        END), 0) as avg_rating
       FROM new_hires nh
       LEFT JOIN skill_assessments sa ON nh.id = sa.new_hire_id
       WHERE nh.department = $1 AND nh.is_active = true
       GROUP BY nh.id, nh.user_id
       ORDER BY avg_rating DESC`,
      [department]
    );

    // Add ranking
    // CRITICAL FIX: PostgreSQL AVG() returns NUMERIC as string, must convert to number first
    const cohortMembers: CohortMember[] = result.rows.map((row, index) => ({
      id: row.id,
      name: row.user_id, // In real scenario, would join with users table to get full name
      avg_rating: Math.round(parseFloat(row.avg_rating) * 100) / 100,
      rank: index + 1
    }));

    return cohortMembers;
  }
}
