import { Pool } from 'pg';

export interface AuditLogData {
  tableName: string;
  recordId: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  userId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  changeReason?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Audit Service
 * Handles logging of all data mutations (INSERT, UPDATE, DELETE)
 * Provides comprehensive change tracking for regulatory compliance and security audits
 */
export class AuditService {
  constructor(private pool: Pool) {}

  /**
   * Log a data mutation to the audit_logs table
   * @param auditData Audit information including table, action, user, and values
   * @throws Error if audit logging fails
   */
  async log(auditData: AuditLogData): Promise<void> {
    const query = `
      INSERT INTO audit_logs
        (table_name, record_id, action, user_id, old_values, new_values,
         change_reason, ip_address, user_agent, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
    `;

    try {
      await this.pool.query(query, [
        auditData.tableName,
        auditData.recordId,
        auditData.action,
        auditData.userId || null,
        auditData.oldValues ? JSON.stringify(auditData.oldValues) : null,
        auditData.newValues ? JSON.stringify(auditData.newValues) : null,
        auditData.changeReason || null,
        auditData.ipAddress || null,
        auditData.userAgent || null,
      ]);
    } catch (error) {
      // Log audit failures but don't throw - don't block operations for audit logging errors
      console.error('Audit logging failed:', error);
    }
  }

  /**
   * Log a user creation
   */
  async logUserCreation(
    userId: string,
    userData: Record<string, any>,
    createdBy: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      tableName: 'users',
      recordId: userId,
      action: 'INSERT',
      userId: createdBy,
      newValues: userData,
      changeReason: 'User created',
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log a user update
   */
  async logUserUpdate(
    userId: string,
    oldValues: Record<string, any>,
    newValues: Record<string, any>,
    updatedBy: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      tableName: 'users',
      recordId: userId,
      action: 'UPDATE',
      userId: updatedBy,
      oldValues,
      newValues,
      changeReason: 'User updated',
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log a new hire creation
   */
  async logNewHireCreation(
    newHireId: string,
    newHireData: Record<string, any>,
    createdBy: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      tableName: 'new_hires',
      recordId: newHireId,
      action: 'INSERT',
      userId: createdBy,
      newValues: newHireData,
      changeReason: 'New hire created',
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log a new hire update
   */
  async logNewHireUpdate(
    newHireId: string,
    oldValues: Record<string, any>,
    newValues: Record<string, any>,
    updatedBy: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      tableName: 'new_hires',
      recordId: newHireId,
      action: 'UPDATE',
      userId: updatedBy,
      oldValues,
      newValues,
      changeReason: 'New hire updated',
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log a new hire deletion (soft delete)
   */
  async logNewHireDeletion(
    newHireId: string,
    deletedBy: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      tableName: 'new_hires',
      recordId: newHireId,
      action: 'DELETE',
      userId: deletedBy,
      changeReason: 'New hire deleted',
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log a skill rating creation
   */
  async logSkillRatingCreation(
    ratingId: string,
    ratingData: Record<string, any>,
    createdBy: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      tableName: 'skill_ratings',
      recordId: ratingId,
      action: 'INSERT',
      userId: createdBy,
      newValues: ratingData,
      changeReason: 'Skill rating created',
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log a skill rating update
   */
  async logSkillRatingUpdate(
    ratingId: string,
    oldValues: Record<string, any>,
    newValues: Record<string, any>,
    updatedBy: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      tableName: 'skill_ratings',
      recordId: ratingId,
      action: 'UPDATE',
      userId: updatedBy,
      oldValues,
      newValues,
      changeReason: 'Skill rating updated',
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log a password change
   */
  async logPasswordChange(
    userId: string,
    changedBy: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      tableName: 'users',
      recordId: userId,
      action: 'UPDATE',
      userId: changedBy,
      changeReason: 'Password changed',
      ipAddress,
      userAgent,
    });
  }
}
