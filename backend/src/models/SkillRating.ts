import { Pool, QueryResult } from 'pg';

export interface SkillRating {
  id: string;
  new_hire_id: string;
  skill_type: 'technical' | 'soft_skill';
  skill_id: string;
  assessor_id: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comments?: string;
  assessment_date: Date;
  is_completed: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * SkillRating Repository for database operations
 * Handles CRUD operations for skill assessments and ratings
 */
export class SkillRatingRepository {
  constructor(private pool: Pool) {}

  /**
   * Upsert a skill rating (insert or update)
   * Uses ON CONFLICT for efficient upsert pattern
   * @param rating Skill rating data to upsert
   * @returns Created or updated skill rating
   */
  async upsert(rating: {
    new_hire_id: string;
    skill_type: 'technical' | 'soft_skill';
    skill_id: string;
    assessor_id: string;
    rating: 1 | 2 | 3 | 4 | 5;
    comments?: string;
    assessment_date: Date;
  }): Promise<SkillRating> {
    // Validate input
    if (!rating.new_hire_id || !rating.skill_id || !rating.skill_type || !rating.assessor_id) {
      throw new Error('Missing required fields: new_hire_id, skill_id, skill_type, assessor_id');
    }

    if (!['technical', 'soft_skill'].includes(rating.skill_type)) {
      throw new Error('Invalid skill_type. Must be "technical" or "soft_skill"');
    }

    if (![1, 2, 3, 4, 5].includes(rating.rating)) {
      throw new Error('Invalid rating. Must be between 1 and 5');
    }

    // Map numeric rating to proficiency_level enum for database storage
    // 1=novice, 2=beginner, 3=intermediate, 4=advanced, 5=expert
    const ratingToLevel: { [key: number]: string } = {
      1: 'novice',
      2: 'beginner',
      3: 'intermediate',
      4: 'advanced',
      5: 'expert',
    };
    const proficiency_level = ratingToLevel[rating.rating];

    // Map skill_type for database (spec uses 'soft_skill', DB uses 'soft')
    const skillTypeForDb = rating.skill_type === 'soft_skill' ? 'soft' : rating.skill_type;

    const query = `
      INSERT INTO skill_assessments
        (new_hire_id, skill_type, skill_id, assessor_id, proficiency_level, comments, assessment_date, is_completed)
      VALUES ($1, $2, $3, $4, $5, $6, $7, true)
      ON CONFLICT (new_hire_id, skill_id, skill_type)
      DO UPDATE SET
        proficiency_level = $5,
        assessor_id = $4,
        comments = $6,
        assessment_date = $7,
        updated_at = CURRENT_TIMESTAMP,
        is_completed = true
      RETURNING *
    `;

    const result: QueryResult = await this.pool.query(query, [
      rating.new_hire_id,
      skillTypeForDb,
      rating.skill_id,
      rating.assessor_id,
      proficiency_level,
      rating.comments || null,
      rating.assessment_date,
    ]);

    if (result.rows.length === 0) {
      throw new Error('Failed to create or update skill rating');
    }

    // Map database result back to SkillRating interface (convert 'soft' back to 'soft_skill')
    const row = result.rows[0];
    const levelToRating: { [key: string]: 1 | 2 | 3 | 4 | 5 } = {
      'novice': 1,
      'beginner': 2,
      'intermediate': 3,
      'advanced': 4,
      'expert': 5,
    };

    return {
      ...row,
      rating: levelToRating[row.proficiency_level] || 3,
      skill_type: row.skill_type === 'soft' ? 'soft_skill' : row.skill_type,
    };
  }

  /**
   * Get all skill ratings for a new hire
   * @param newHireId New hire ID
   * @returns Array of skill ratings
   */
  async getByNewHire(newHireId: string): Promise<SkillRating[]> {
    const query = `
      SELECT * FROM skill_assessments
      WHERE new_hire_id = $1
      ORDER BY assessment_date DESC, created_at DESC
    `;

    const result: QueryResult<SkillRating> = await this.pool.query(query, [newHireId]);
    return result.rows;
  }

  /**
   * Get a specific skill rating
   * @param newHireId New hire ID
   * @param skillId Skill ID
   * @param skillType Type of skill (technical or soft)
   * @returns Skill rating or null if not found
   */
  async getBySkillId(newHireId: string, skillId: string, skillType: 'technical' | 'soft'): Promise<SkillRating | null> {
    const query = `
      SELECT * FROM skill_assessments
      WHERE new_hire_id = $1 AND skill_id = $2 AND skill_type = $3
      LIMIT 1
    `;

    const result: QueryResult<SkillRating> = await this.pool.query(query, [newHireId, skillId, skillType]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Get all ratings by skill type for a new hire
   * @param newHireId New hire ID
   * @param skillType Type of skill to filter by
   * @returns Array of skill ratings
   */
  async getBySkillType(newHireId: string, skillType: 'technical' | 'soft'): Promise<SkillRating[]> {
    const query = `
      SELECT * FROM skill_assessments
      WHERE new_hire_id = $1 AND skill_type = $2
      ORDER BY assessment_date DESC
    `;

    const result: QueryResult<SkillRating> = await this.pool.query(query, [newHireId, skillType]);
    return result.rows;
  }

  /**
   * Calculate average proficiency for a new hire
   * @param newHireId New hire ID
   * @param skillType Optional: filter by skill type
   * @returns Average proficiency level (1-5)
   */
  async getAverageProficiency(newHireId: string, skillType?: 'technical' | 'soft'): Promise<number> {
    const proficiencyMap = {
      'novice': 1,
      'beginner': 2,
      'intermediate': 3,
      'advanced': 4,
      'expert': 5,
    };

    let query = `
      SELECT proficiency_level FROM skill_assessments
      WHERE new_hire_id = $1
    `;
    const params: any[] = [newHireId];

    if (skillType) {
      query += ` AND skill_type = $${params.length + 1}`;
      params.push(skillType);
    }

    const result: QueryResult = await this.pool.query(query, params);

    if (result.rows.length === 0) {
      return 0;
    }

    const sum = result.rows.reduce((acc, row) => {
      return acc + (proficiencyMap[row.proficiency_level as keyof typeof proficiencyMap] || 0);
    }, 0);

    return Math.round((sum / result.rows.length) * 100) / 100;
  }

  /**
   * Get ratings by assessor (for audit trail)
   * @param assessorId Assessor user ID
   * @returns Array of skill ratings
   */
  async getByAssessor(assessorId: string): Promise<SkillRating[]> {
    const query = `
      SELECT * FROM skill_assessments
      WHERE assessor_id = $1
      ORDER BY assessment_date DESC
    `;

    const result: QueryResult<SkillRating> = await this.pool.query(query, [assessorId]);
    return result.rows;
  }
}
