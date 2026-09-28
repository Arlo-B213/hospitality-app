import express, { Router, Request, Response } from 'express';
import { Pool, QueryResult } from 'pg';
import { SkillRatingRepository } from '../models/SkillRating';
import { NewHireRepository } from '../models/NewHire';
import { requireAuth } from '../middleware/auth';
import { ROLES, ROLE_HIERARCHY } from '../middleware/rbac';

/**
 * Create evaluations router with 4 endpoints:
 * - GET /api/evaluations/:newHireId - fetch all ratings for new hire (RBAC: team-based visibility)
 * - POST /api/evaluations/skills - rate a skill (RBAC: team-based rating)
 * - POST /api/evaluations/leadership/:newHireId/:moduleId - mark leadership module complete (manager/asst_manager only)
 * - PUT /api/evaluations/summary/:newHireId - update evaluation summary (RBAC: team-based)
 */
export function createEvaluationsRouter(pool: Pool): Router {
  const router = express.Router();
  const ratingRepo = new SkillRatingRepository(pool);
  const newHireRepo = new NewHireRepository(pool);

  /**
   * GET /api/evaluations/:newHireId
   * Fetch all skill ratings for a new hire
   * RBAC: FOH staff can only see FOH new hire ratings, BOH staff can only see BOH ratings, managers/admins can see both
   */
  router.get(
    '/:newHireId',
    requireAuth,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { newHireId } = req.params;

        // Validate new hire exists
        const newHire = await newHireRepo.getById(newHireId);
        if (!newHire) {
          res.status(404).json({
            error: 'Not Found',
            message: 'New hire not found',
            timestamp: new Date().toISOString(),
          });
          return;
        }

        // RBAC: Enforce team boundary
        // Admin and managers can see all teams
        if (req.user?.role !== ROLES.ADMIN && req.user?.role !== ROLES.MANAGER) {
          // Team-specific staff can only see their own team
          if (req.user?.team !== newHire.department) {
            res.status(403).json({
              error: 'Forbidden',
              message: `You can only view evaluations for ${req.user?.team} team new hires`,
              timestamp: new Date().toISOString(),
            });
            return;
          }
        }

        // Fetch all ratings for the new hire
        const ratings = await ratingRepo.getByNewHire(newHireId);

        res.status(200).json({
          newHireId,
          totalRatings: ratings.length,
          ratings,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error fetching evaluations:', error);
        res.status(500).json({
          error: 'Internal Server Error',
          message: error instanceof Error ? error.message : 'Failed to fetch evaluations',
          timestamp: new Date().toISOString(),
        });
      }
    }
  );

  /**
   * POST /api/evaluations/skills
   * Rate a technical or soft skill for a new hire
   * Uses upsert pattern (ON CONFLICT ... DO UPDATE)
   * Accepts numeric rating (1-5) mapped to proficiency levels:
   *   1=novice, 2=beginner, 3=intermediate, 4=advanced, 5=expert
   * RBAC: FOH staff can only rate FOH new hires, BOH staff can only rate BOH new hires,
   *       managers/admins can rate both
   */
  router.post(
    '/skills',
    requireAuth,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { new_hire_id, skill_type, skill_id, rating, comments } = req.body;

        // Validate required fields
        if (!new_hire_id || !skill_type || !skill_id || rating === undefined) {
          res.status(400).json({
            error: 'Bad Request',
            message: 'Missing required fields: new_hire_id, skill_type, skill_id, rating',
            timestamp: new Date().toISOString(),
          });
          return;
        }

        // Validate skill type
        if (!['technical', 'soft_skill'].includes(skill_type)) {
          res.status(400).json({
            error: 'Bad Request',
            message: 'Invalid skill_type. Must be "technical" or "soft_skill"',
            timestamp: new Date().toISOString(),
          });
          return;
        }

        // Validate rating (1-5)
        if (![1, 2, 3, 4, 5].includes(Number(rating))) {
          res.status(400).json({
            error: 'Bad Request',
            message: 'Invalid rating. Must be between 1 and 5 (1=novice, 2=beginner, 3=intermediate, 4=advanced, 5=expert)',
            timestamp: new Date().toISOString(),
          });
          return;
        }

        // Validate new hire exists
        const newHire = await newHireRepo.getById(new_hire_id);
        if (!newHire) {
          res.status(404).json({
            error: 'Not Found',
            message: 'New hire not found',
            timestamp: new Date().toISOString(),
          });
          return;
        }

        // RBAC: Enforce team boundary for skill rating
        // Admin and managers can rate all teams
        if (req.user?.role !== ROLES.ADMIN && req.user?.role !== ROLES.MANAGER) {
          // Team-specific staff can only rate their own team
          if (req.user?.team !== newHire.department) {
            res.status(403).json({
              error: 'Forbidden',
              message: `You can only rate ${req.user?.team} team new hires. This new hire belongs to ${newHire.department} team.`,
              timestamp: new Date().toISOString(),
            });
            return;
          }
        }

        // Validate skill exists in appropriate table
        let skillCheckQuery = '';
        if (skill_type === 'technical') {
          skillCheckQuery = 'SELECT id FROM technical_skills WHERE id = $1 AND is_active = true';
        } else {
          skillCheckQuery = 'SELECT id FROM soft_skills WHERE id = $1 AND is_active = true';
        }

        const skillResult = await pool.query(skillCheckQuery, [skill_id]);
        if (skillResult.rows.length === 0) {
          res.status(404).json({
            error: 'Not Found',
            message: `${skill_type === 'technical' ? 'Technical' : 'Soft'} skill not found`,
            timestamp: new Date().toISOString(),
          });
          return;
        }

        // Upsert the skill rating
        const skillRating = await ratingRepo.upsert({
          new_hire_id,
          skill_type,
          skill_id,
          assessor_id: req.user!.userId,
          rating: Number(rating) as 1 | 2 | 3 | 4 | 5,
          comments: comments || undefined,
          assessment_date: new Date(),
        });

        res.status(201).json({
          message: 'Skill rating saved successfully',
          rating: skillRating,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error saving skill rating:', error);
        res.status(500).json({
          error: 'Internal Server Error',
          message: error instanceof Error ? error.message : 'Failed to save skill rating',
          timestamp: new Date().toISOString(),
        });
      }
    }
  );

  /**
   * POST /api/evaluations/leadership/:newHireId/:moduleId
   * Mark a leadership module as completed
   * RBAC: Only manager and asst_manager roles (determined by ROLE_HIERARCHY >= 3)
   */
  router.post(
    '/leadership/:newHireId/:moduleId',
    requireAuth,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { newHireId, moduleId } = req.params;
        const { progress_notes } = req.body;

        // Validate moduleId is integer between 1-8
        const parsedModuleId = parseInt(moduleId, 10);
        if (isNaN(parsedModuleId) || parsedModuleId < 1 || parsedModuleId > 8) {
          res.status(400).json({
            error: 'Bad Request',
            message: 'Module ID must be an integer between 1 and 8',
            timestamp: new Date().toISOString(),
          });
          return;
        }

        // RBAC: Only manager and asst_manager can mark leadership modules complete
        // Use ROLE_HIERARCHY to avoid hardcoding role arrays
        const userHierarchy = ROLE_HIERARCHY[req.user?.role as keyof typeof ROLE_HIERARCHY] ?? -1;
        const asst_manager_hierarchy = ROLE_HIERARCHY[ROLES.ASST_MANAGER as keyof typeof ROLE_HIERARCHY];

        if (userHierarchy < asst_manager_hierarchy) {
          res.status(403).json({
            error: 'Forbidden',
            message: 'Only managers and assistant managers can mark leadership modules complete',
            timestamp: new Date().toISOString(),
          });
          return;
        }

        // Validate new hire exists
        const newHire = await newHireRepo.getById(newHireId);
        if (!newHire) {
          res.status(404).json({
            error: 'Not Found',
            message: 'New hire not found',
            timestamp: new Date().toISOString(),
          });
          return;
        }

        // Validate leadership module exists
        const moduleCheckQuery = 'SELECT id FROM leadership_modules WHERE id = $1 AND is_active = true';
        const moduleResult = await pool.query(moduleCheckQuery, [parsedModuleId]);
        if (moduleResult.rows.length === 0) {
          res.status(404).json({
            error: 'Not Found',
            message: 'Leadership module not found',
            timestamp: new Date().toISOString(),
          });
          return;
        }

        // Upsert leadership progress record (mark as completed)
        const query = `
          INSERT INTO leadership_progress
            (new_hire_id, leadership_module_id, status, completion_date, mentor_id, progress_notes, is_completed)
          VALUES ($1, $2, 'completed', CURRENT_DATE, $3, $4, true)
          ON CONFLICT (new_hire_id, leadership_module_id)
          DO UPDATE SET
            status = 'completed',
            completion_date = CURRENT_DATE,
            mentor_id = $3,
            progress_notes = COALESCE($4, progress_notes),
            is_completed = true,
            updated_at = CURRENT_TIMESTAMP
          RETURNING *
        `;

        const result: QueryResult = await pool.query(query, [
          newHireId,
          parsedModuleId,
          req.user!.userId,
          progress_notes || null,
        ]);

        if (result.rows.length === 0) {
          throw new Error('Failed to update leadership progress');
        }

        res.status(201).json({
          message: 'Leadership module marked as completed',
          progress: result.rows[0],
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error marking leadership module complete:', error);
        res.status(500).json({
          error: 'Internal Server Error',
          message: error instanceof Error ? error.message : 'Failed to mark leadership module complete',
          timestamp: new Date().toISOString(),
        });
      }
    }
  );

  /**
   * PUT /api/evaluations/summary/:newHireId
   * Update evaluation summary (strengths, areas for improvement, action items)
   * RBAC: Team-based - FOH staff can only update FOH summaries, BOH staff only BOH,
   *       managers/admins can update both
   */
  router.put(
    '/summary/:newHireId',
    requireAuth,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { newHireId } = req.params;
        const { overall_rating, strengths, areas_for_improvement, action_items } = req.body;

        // Validate new hire exists
        const newHire = await newHireRepo.getById(newHireId);
        if (!newHire) {
          res.status(404).json({
            error: 'Not Found',
            message: 'New hire not found',
            timestamp: new Date().toISOString(),
          });
          return;
        }

        // RBAC: Enforce team boundary for summary updates
        // Admin and managers can update all teams
        if (req.user?.role !== ROLES.ADMIN && req.user?.role !== ROLES.MANAGER) {
          // Team-specific staff can only update their own team
          if (req.user?.team !== newHire.department) {
            res.status(403).json({
              error: 'Forbidden',
              message: `You can only update summaries for ${req.user?.team} team new hires`,
              timestamp: new Date().toISOString(),
            });
            return;
          }
        }

        // Validate overall_rating if provided
        if (overall_rating && !['novice', 'beginner', 'intermediate', 'advanced', 'expert'].includes(overall_rating)) {
          res.status(400).json({
            error: 'Bad Request',
            message: 'Invalid overall_rating. Must be one of: novice, beginner, intermediate, advanced, expert',
            timestamp: new Date().toISOString(),
          });
          return;
        }

        // Upsert evaluation summary
        const query = `
          INSERT INTO evaluation_summaries
            (new_hire_id, evaluation_type, evaluator_id, overall_rating, strengths, areas_for_improvement, action_items, status, evaluation_date, due_date, is_submitted)
          VALUES ($1, '90_day', $2, COALESCE($3, 'intermediate'), $4, $5, $6, 'in_progress', CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', false)
          ON CONFLICT (new_hire_id, evaluation_type)
          DO UPDATE SET
            overall_rating = COALESCE($3, evaluation_summaries.overall_rating),
            strengths = COALESCE($4, evaluation_summaries.strengths),
            areas_for_improvement = COALESCE($5, evaluation_summaries.areas_for_improvement),
            action_items = COALESCE($6, evaluation_summaries.action_items),
            evaluator_id = $2,
            updated_at = CURRENT_TIMESTAMP
          RETURNING *
        `;

        const result: QueryResult = await pool.query(query, [
          newHireId,
          req.user!.userId,
          overall_rating || null,
          strengths || null,
          areas_for_improvement || null,
          action_items || null,
        ]);

        if (result.rows.length === 0) {
          throw new Error('Failed to update evaluation summary');
        }

        res.status(200).json({
          message: 'Evaluation summary updated successfully',
          summary: result.rows[0],
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error updating evaluation summary:', error);
        res.status(500).json({
          error: 'Internal Server Error',
          message: error instanceof Error ? error.message : 'Failed to update evaluation summary',
          timestamp: new Date().toISOString(),
        });
      }
    }
  );

  return router;
}
