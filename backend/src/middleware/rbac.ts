import { Request, Response, NextFunction } from 'express';

/**
 * Role definitions and their permissions
 * Based on PRIDE Training App specification
 */
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  ASST_MANAGER: 'asst_manager',
  FOH_LEAD: 'foh_lead',
  CHEF: 'chef',
  SOUS_CHEF: 'sous_chef',
  ASST_CHEF: 'asst_chef',
  NEW_HIRE: 'new_hire',
};

/**
 * Team assignments for roles
 * Some roles are team-agnostic (admin, manager, new_hire)
 */
export const ROLE_TEAMS = {
  [ROLES.ADMIN]: null, // Team-agnostic
  [ROLES.MANAGER]: null, // Team-agnostic
  [ROLES.ASST_MANAGER]: ['FOH', 'BOH'], // Can be assigned to either team
  [ROLES.FOH_LEAD]: ['FOH'], // Front-of-house only
  [ROLES.CHEF]: ['BOH'], // Back-of-house only
  [ROLES.SOUS_CHEF]: ['BOH'], // Back-of-house only
  [ROLES.ASST_CHEF]: ['BOH'], // Back-of-house only
  [ROLES.NEW_HIRE]: null, // Team assigned separately during onboarding
};

/**
 * Role hierarchy - higher roles can perform lower role actions
 * admin > manager > asst_manager > team-specific leads
 */
export const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: 5,
  [ROLES.MANAGER]: 4,
  [ROLES.ASST_MANAGER]: 3,
  [ROLES.FOH_LEAD]: 2,
  [ROLES.CHEF]: 2,
  [ROLES.SOUS_CHEF]: 1,
  [ROLES.ASST_CHEF]: 1,
  [ROLES.NEW_HIRE]: 0,
};

/**
 * Middleware to require specific teams
 * @param allowedTeams Array of allowed team strings (FOH, BOH)
 * @returns Middleware function that checks team
 */
export function requireTeam(...allowedTeams: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Ensure user is authenticated
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Admins and managers are team-agnostic
    if (req.user.role === ROLES.ADMIN || req.user.role === ROLES.MANAGER) {
      next();
      return;
    }

    // Check if user's team is in allowed teams
    if (!req.user.team || !allowedTeams.includes(req.user.team)) {
      res.status(403).json({
        error: 'Forbidden',
        message: `This action requires one of these teams: ${allowedTeams.join(', ')}`,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  };
}

/**
 * Middleware to require minimum role level
 * Uses role hierarchy - allows same role and higher roles
 * @param minRole Minimum role level required
 * @returns Middleware function that checks role hierarchy
 */
export function requireMinimumRole(minRole: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Ensure user is authenticated
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const userHierarchy = ROLE_HIERARCHY[req.user.role as keyof typeof ROLE_HIERARCHY] ?? -1;
    const requiredHierarchy = ROLE_HIERARCHY[minRole as keyof typeof ROLE_HIERARCHY] ?? -1;

    if (userHierarchy < requiredHierarchy) {
      res.status(403).json({
        error: 'Forbidden',
        message: `This action requires a role at level ${requiredHierarchy} or higher`,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  };
}

/**
 * Middleware to enforce team membership consistency
 * Validates that user can only access resources in their assigned team
 * @param teamParam Name of the team parameter in req.params or req.body (default: 'team')
 * @returns Middleware function that checks team consistency
 */
export function enforceTeamBoundary(teamParam: string = 'team') {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Ensure user is authenticated
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Admins and managers can access all teams
    if (req.user.role === ROLES.ADMIN || req.user.role === ROLES.MANAGER) {
      next();
      return;
    }

    // Get requested team from params or body
    const requestedTeam = req.params[teamParam] || req.body[teamParam];

    // If no team is specified, and user has a team, allow it
    if (!requestedTeam && !req.user.team) {
      next();
      return;
    }

    // Check if requested team matches user's team
    if (requestedTeam && req.user.team !== requestedTeam) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'You can only access resources in your assigned team',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  };
}

/**
 * Validate that a role is valid according to the specification
 * @param role Role string to validate
 * @returns true if role is valid
 */
export function isValidRole(role: string): boolean {
  return Object.values(ROLES).includes(role);
}

/**
 * Validate that a team is valid
 * @param team Team string to validate
 * @returns true if team is valid
 */
export function isValidTeam(team: string | null | undefined): boolean {
  if (!team) return true; // null is valid for team-agnostic roles
  return ['FOH', 'BOH'].includes(team);
}

/**
 * Check if a role requires a team assignment
 * @param role Role to check
 * @returns true if role requires team assignment
 */
export function roleRequiresTeam(role: string): boolean {
  const teamsList = ROLE_TEAMS[role as keyof typeof ROLE_TEAMS];
  return teamsList !== null;
}

/**
 * Check if a role can be assigned to a specific team
 * @param role Role to check
 * @param team Team to check
 * @returns true if role can be assigned to team
 */
export function canRoleBeAssignedToTeam(role: string, team: string): boolean {
  const allowedTeams = ROLE_TEAMS[role as keyof typeof ROLE_TEAMS];
  if (allowedTeams === null) {
    return true; // Role is team-agnostic
  }
  return allowedTeams.includes(team);
}
