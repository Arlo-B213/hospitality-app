import express, { Router, Request, Response } from 'express';
import { NewHireRepository } from '../models/NewHire';
import { requireAuth, requireRole } from '../middleware/auth';
import { Pool } from 'pg';

export function createNewHiresRouter(pool: Pool): Router {
  const router = express.Router();
  const repo = new NewHireRepository(pool);

  /**
   * Helper function to check if user can access a hire based on team/department
   * Managers (manager, asst_manager, admin) can see both FOH and BOH
   * Regular staff can only see their own team
   */
  function canAccessHire(userRole: string, userTeam: string | undefined, hireDepartment: string): boolean {
    // Admins, managers, and assistant managers can access all departments
    if (userRole === 'admin' || userRole === 'manager' || userRole === 'asst_manager') {
      return true;
    }

    // Regular staff can only access hires from their own team
    if (userTeam === hireDepartment) {
      return true;
    }

    return false;
  }

  /**
   * GET /api/new-hires
   * List all new hires with RBAC filtering
   * - Managers/admins see all new hires
   * - FOH staff see only FOH new hires
   * - BOH staff see only BOH new hires
   * Query params: department, is_active
   */
  router.get('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
    try {
      const filters: any = { is_active: true };

      // Apply team-based filtering for non-managers
      if (req.user?.role !== 'admin' && req.user?.role !== 'manager' && req.user?.role !== 'asst_manager') {
        // Regular staff can only see their own team
        if (!req.user?.team) {
          res.status(400).json({
            error: 'Bad Request',
            message: 'User team not specified',
            timestamp: new Date().toISOString(),
          });
          return;
        }
        filters.department = req.user.team;
      }

      // Allow filtering by department via query parameter (if user has permission)
      if (req.query.department) {
        const requestedDept = req.query.department as string;
        // Non-managers can only filter for their own team
        if (
          req.user?.role !== 'admin' &&
          req.user?.role !== 'manager' &&
          req.user?.role !== 'asst_manager' &&
          requestedDept !== req.user?.team
        ) {
          res.status(403).json({
            error: 'Forbidden',
            message: 'You can only view new hires from your own team',
            timestamp: new Date().toISOString(),
          });
          return;
        }
        filters.department = requestedDept;
      }

      const newHires = await repo.list(filters);
      res.json(newHires);
    } catch (error) {
      console.error('Error listing new hires:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to list new hires',
        timestamp: new Date().toISOString(),
      });
    }
  });

  /**
   * GET /api/new-hires/:id
   * Get a single new hire by ID with RBAC enforcement
   */
  router.get('/:id', requireAuth, async (req: Request, res: Response): Promise<void> => {
    try {
      const newHire = await repo.getById(req.params.id);

      if (!newHire) {
        res.status(404).json({
          error: 'Not Found',
          message: 'New hire not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // RBAC: Check if user can access this hire
      if (!canAccessHire(req.user?.role || '', req.user?.team, newHire.department)) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'You do not have permission to view this new hire',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.json(newHire);
    } catch (error) {
      console.error('Error fetching new hire:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch new hire',
        timestamp: new Date().toISOString(),
      });
    }
  });

  /**
   * POST /api/new-hires
   * Create a new hire record
   * Required role: manager, asst_manager
   * Required fields: user_id, department, start_date, day_90_target_date
   */
  router.post(
    '/',
    requireAuth,
    requireRole('manager', 'asst_manager'),
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { user_id, department, start_date, day_90_target_date } = req.body;

        // Validate required fields
        if (!user_id || !department || !start_date || !day_90_target_date) {
          res.status(400).json({
            error: 'Bad Request',
            message: 'Missing required fields: user_id, department, start_date, day_90_target_date',
            timestamp: new Date().toISOString(),
          });
          return;
        }

        // Validate department value
        if (department !== 'FOH' && department !== 'BOH') {
          res.status(400).json({
            error: 'Bad Request',
            message: 'Invalid department. Must be FOH or BOH',
            timestamp: new Date().toISOString(),
          });
          return;
        }

        // Validate dates
        const startDate = new Date(start_date);
        const day90Date = new Date(day_90_target_date);

        if (isNaN(startDate.getTime()) || isNaN(day90Date.getTime())) {
          res.status(400).json({
            error: 'Bad Request',
            message: 'Invalid date format. Use ISO 8601 format',
            timestamp: new Date().toISOString(),
          });
          return;
        }

        if (day90Date <= startDate) {
          res.status(400).json({
            error: 'Bad Request',
            message: 'day_90_target_date must be after start_date',
            timestamp: new Date().toISOString(),
          });
          return;
        }

        // Check if user exists and is active
        const userCheckResult = await pool.query('SELECT id, team FROM users WHERE id = $1 AND is_active = true', [
          user_id,
        ]);

        if (userCheckResult.rows.length === 0) {
          res.status(400).json({
            error: 'Bad Request',
            message: 'User not found or is inactive',
            timestamp: new Date().toISOString(),
          });
          return;
        }

        // RBAC: Non-managers can only create hires for their own team
        if (
          req.user?.role !== 'admin' &&
          req.user?.role !== 'manager' &&
          req.user?.role !== 'asst_manager'
        ) {
          if (department !== req.user?.team) {
            res.status(403).json({
              error: 'Forbidden',
              message: 'You can only create new hires for your own team',
              timestamp: new Date().toISOString(),
            });
            return;
          }
        }

        const newHire = await repo.create({
          user_id,
          department,
          start_date: startDate,
          day_90_target_date: day90Date,
          hire_manager_id: req.user!.userId,
        });

        res.status(201).json(newHire);
      } catch (error) {
        console.error('Error creating new hire:', error);
        res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to create new hire',
          timestamp: new Date().toISOString(),
        });
      }
    }
  );

  /**
   * PUT /api/new-hires/:id
   * Update a new hire record
   * Required role: manager, asst_manager
   * Allowed fields: department, start_date, day_90_target_date, is_active
   */
  router.put(
    '/:id',
    requireAuth,
    requireRole('manager', 'asst_manager'),
    async (req: Request, res: Response): Promise<void> => {
      try {
        const existingNewHire = await repo.getByIdIncludeInactive(req.params.id);

        if (!existingNewHire) {
          res.status(404).json({
            error: 'Not Found',
            message: 'New hire not found',
            timestamp: new Date().toISOString(),
          });
          return;
        }

        // RBAC: Check if user can update this hire
        if (!canAccessHire(req.user?.role || '', req.user?.team, existingNewHire.department)) {
          res.status(403).json({
            error: 'Forbidden',
            message: 'You do not have permission to update this new hire',
            timestamp: new Date().toISOString(),
          });
          return;
        }

        const updates: any = {};

        // Validate and apply department update
        if (req.body.department !== undefined) {
          if (req.body.department !== 'FOH' && req.body.department !== 'BOH') {
            res.status(400).json({
              error: 'Bad Request',
              message: 'Invalid department. Must be FOH or BOH',
              timestamp: new Date().toISOString(),
            });
            return;
          }
          updates.department = req.body.department;
        }

        // Validate and apply start_date update
        if (req.body.start_date !== undefined) {
          const startDate = new Date(req.body.start_date);
          if (isNaN(startDate.getTime())) {
            res.status(400).json({
              error: 'Bad Request',
              message: 'Invalid start_date format. Use ISO 8601 format',
              timestamp: new Date().toISOString(),
            });
            return;
          }
          updates.start_date = startDate;
        }

        // Validate and apply day_90_target_date update
        if (req.body.day_90_target_date !== undefined) {
          const day90Date = new Date(req.body.day_90_target_date);
          if (isNaN(day90Date.getTime())) {
            res.status(400).json({
              error: 'Bad Request',
              message: 'Invalid day_90_target_date format. Use ISO 8601 format',
              timestamp: new Date().toISOString(),
            });
            return;
          }
          updates.day_90_target_date = day90Date;
        }

        // Validate date relationship
        const finalStartDate = updates.start_date || existingNewHire.start_date;
        const finalDay90Date = updates.day_90_target_date || existingNewHire.day_90_target_date;
        if (finalDay90Date <= finalStartDate) {
          res.status(400).json({
            error: 'Bad Request',
            message: 'day_90_target_date must be after start_date',
            timestamp: new Date().toISOString(),
          });
          return;
        }

        // Apply is_active update
        if (req.body.is_active !== undefined) {
          updates.is_active = Boolean(req.body.is_active);
        }

        const updated = await repo.update(req.params.id, updates);
        res.json(updated);
      } catch (error) {
        console.error('Error updating new hire:', error);
        res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to update new hire',
          timestamp: new Date().toISOString(),
        });
      }
    }
  );

  /**
   * DELETE /api/new-hires/:id
   * Soft delete a new hire (mark as inactive)
   * Required role: manager, asst_manager
   */
  router.delete(
    '/:id',
    requireAuth,
    requireRole('manager', 'asst_manager'),
    async (req: Request, res: Response): Promise<void> => {
      try {
        const existingNewHire = await repo.getByIdIncludeInactive(req.params.id);

        if (!existingNewHire) {
          res.status(404).json({
            error: 'Not Found',
            message: 'New hire not found',
            timestamp: new Date().toISOString(),
          });
          return;
        }

        // RBAC: Check if user can delete this hire
        if (!canAccessHire(req.user?.role || '', req.user?.team, existingNewHire.department)) {
          res.status(403).json({
            error: 'Forbidden',
            message: 'You do not have permission to delete this new hire',
            timestamp: new Date().toISOString(),
          });
          return;
        }

        await repo.deactivate(req.params.id);

        res.status(204).send();
      } catch (error) {
        console.error('Error deleting new hire:', error);
        res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to delete new hire',
          timestamp: new Date().toISOString(),
        });
      }
    }
  );

  return router;
}
