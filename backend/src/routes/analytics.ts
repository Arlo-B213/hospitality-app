import express, { Router, Request, Response } from 'express';
import { AnalyticsService } from '../services/AnalyticsService';
import { NewHireRepository } from '../models/NewHire';
import { requireAuth } from '../middleware/auth';
import { ROLES } from '../middleware/rbac';
import { Pool } from 'pg';

/**
 * Create analytics router with 2 endpoints:
 * - GET /api/analytics/cohort/summary - fetch cohort-level analytics (managers/admins only)
 * - GET /api/analytics/:newHireId - fetch progress metrics and analytics for a new hire
 *
 * IMPORTANT: /cohort/summary MUST be defined BEFORE /:newHireId to prevent parameter
 * route from capturing 'cohort' as the newHireId parameter
 */
export function createAnalyticsRouter(pool: Pool): Router {
  const router = express.Router();
  const service = new AnalyticsService(pool);
  const newHireRepo = new NewHireRepository(pool);

  /**
   * GET /api/analytics/cohort/summary
   * Fetch cohort-level analytics for a department
   * Query param: department (FOH or BOH, defaults to FOH)
   * RBAC: Only managers and admins can view cohort analytics
   * Caching: Cache-Control max-age=60 (1 minute)
   */
  router.get(
    '/cohort/summary',
    requireAuth,
    async (req: Request, res: Response): Promise<void> => {
      try {
        // RBAC: Only managers and admins can view cohort analytics
        if (
          ![ROLES.MANAGER, ROLES.ADMIN].includes(req.user?.role || '')
        ) {
          res.status(403).json({
            error: 'Forbidden',
            message: 'Only managers and admins can view cohort analytics',
            timestamp: new Date().toISOString(),
          });
          return;
        }

        const department = (req.query.department as 'FOH' | 'BOH') || 'FOH';

        // Validate department
        if (!['FOH', 'BOH'].includes(department)) {
          res.status(400).json({
            error: 'Bad Request',
            message: 'Invalid department. Must be FOH or BOH',
            timestamp: new Date().toISOString(),
          });
          return;
        }

        const cohort = await service.getCohortAnalytics(department);
        const responseData = {
          department,
          total_members: cohort.length,
          members: cohort,
          timestamp: new Date().toISOString(),
        };

        // Set cache headers: cache for 1 minute
        res.set('Cache-Control', 'public, max-age=60');
        res.set('Vary', 'Authorization');
        res.json(responseData);
      } catch (error) {
        console.error('Error fetching cohort analytics:', error);
        res.status(500).json({
          error: 'Internal Server Error',
          message:
            error instanceof Error ? error.message : 'Failed to fetch cohort analytics',
          timestamp: new Date().toISOString(),
        });
      }
    }
  );

  /**
   * GET /api/analytics/:newHireId
   * Fetch progress metrics and analytics for a new hire
   * Includes: days elapsed, completion percentage, skill averages, weekly trends, cohort comparison
   * RBAC: Managers and admins can view all new hires,
   *       Team staff can only view their own team new hires
   * Caching: Cache-Control max-age=300 (5 minutes)
   */
  router.get(
    '/:newHireId',
    requireAuth,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const newHire = await newHireRepo.getById(req.params.newHireId);
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
        if (
          req.user?.role !== ROLES.ADMIN &&
          req.user?.role !== ROLES.MANAGER
        ) {
          // Team-specific staff can only see their own team
          if (req.user?.team !== newHire.department) {
            res.status(403).json({
              error: 'Forbidden',
              message: `You can only view analytics for ${req.user?.team} team new hires`,
              timestamp: new Date().toISOString(),
            });
            return;
          }
        }

        const analytics = await service.getNewHireAnalytics(
          req.params.newHireId
        );

        // Set cache headers: cache for 5 minutes
        res.set('Cache-Control', 'public, max-age=300');
        res.set('Vary', 'Authorization');
        res.json(analytics);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({
          error: 'Internal Server Error',
          message:
            error instanceof Error ? error.message : 'Failed to fetch analytics',
          timestamp: new Date().toISOString(),
        });
      }
    }
  );

  return router;
}
