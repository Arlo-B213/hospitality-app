# PRIDE Training App - Security Audit Report

**Date:** 2026-09-28  
**Scope:** RBAC, Input Validation, JWT, Audit Logging, Credentials, SQL Injection

## Executive Summary

The PRIDE Training App has a solid security foundation but contains **1 CRITICAL issue** and **3 HIGH severity issues** requiring immediate remediation before production deployment.

### Overall Risk: **HIGH** (Not production-ready)

---

## 1. RBAC Enforcement ✓ SECURE (with 1 routing bug)

### Findings:

#### ✓ PASS: Role Hierarchy Implemented
- **File:** `backend/src/middleware/rbac.ts:37-46`
- Role hierarchy: `admin(5) > manager(4) > asst_manager(3) > leads(2) > staff(1) > new_hire(0)`
- Consistently applied via `requireMinimumRole()` middleware

#### ✓ PASS: Team Boundary Enforcement
- **File:** `backend/src/middleware/rbac.ts:125-164`
- `enforceTeamBoundary()` validates team assignment correctly
- Admins/managers bypass team checks; non-managers restricted to their team

#### ✓ PASS: Role-Based Access Control Applied
- `/auth/admin/create-user` requires admin role
- POST `/api/new-hires` requires manager/asst_manager
- Leadership modules require asst_manager or higher

#### ✗ BUG: Route Priority Issue in Analytics (Functionality Issue)
- **File:** `backend/src/routes/analytics.ts`
- **Severity:** HIGH (breaks functionality, not a security issue)

**Problem:**
Route `/:newHireId` defined before `/cohort/summary` causes requests to `GET /api/analytics/cohort/summary` to match the parameter route with `newHireId='cohort'`, returning 404 instead of reaching the cohort route.

**Fix:**
Define `/cohort/summary` BEFORE `/:newHireId`:
```typescript
router.get('/cohort/summary', requireAuth, ...);
router.get('/:newHireId', requireAuth, ...);
```

---

## 2. Input Validation ✓ SECURE

### Findings:

#### ✓ PASS: Email Format Validation
- Database constraint: `CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')`
- Application layer validation in `AuthService`

#### ✓ PASS: Rating Validation (1-5 Only)
- **Files:** `backend/src/routes/evaluations.ts:113-121`, `backend/src/models/SkillRating.ts:48-50`
- Both routes and model validate ratings strictly

#### ✓ PASS: Department/Team Validation
- Department values: must be in `['FOH', 'BOH']`
- Database CHECK constraints enforce this

#### ✓ PASS: Text Fields Sanitization (XSS Prevention)
- React automatically escapes text content
- No `dangerouslySetInnerHTML()` found
- All text fields use parameterized database queries
- **XSS Risk:** LOW - No vulnerabilities detected

#### ✓ PASS: Required Field Validation
- All POST/PUT endpoints validate required fields
- Database NOT NULL constraints provide secondary validation

#### ✓ PASS: Date Validation
- ISO 8601 format validation
- Date relationship validation (e.g., `day_90_target_date > start_date`)

---

## 3. SQL Injection Prevention ✓ SECURE

### Findings:

#### ✓ PASS: All Queries Use Parameterized Statements
All queries use parameterized values (`$1`, `$2`, etc.):
- `backend/src/models/User.ts` - All parameterized
- `backend/src/models/SkillRating.ts` - All parameterized  
- `backend/src/models/NewHire.ts` - All parameterized
- `backend/src/routes/evaluations.ts` - All parameterized

No string concatenation found in SQL query construction.

#### ✓ PASS: Skill ID Validation via Database Trigger
**File:** `backend/src/db/schema.sql:281-302`

Database trigger `validate_skill_id()` prevents references to non-existent skills.

---

## 4. JWT & Authentication ✓ MOSTLY SECURE (2 issues)

### Findings:

#### ✓ PASS: JWT Secret Management
- JWT_SECRET loaded from environment variable
- Not hardcoded
- Throws error if not configured
- **Recommendation:** Ensure 32+ character secret in production

#### ✓ PASS: Token Verification
- `verifyToken()` properly validates signature
- Handles token expiration separately
- Returns payload only after successful verification

#### ✓ PASS: Password Hashing
- Uses bcryptjs with 12 rounds (cryptographically secure)
- BCRYPT_ROUNDS configurable via environment
- **Security Level:** ★★★★★

#### ✓ PASS: Password Change Endpoint
- Requires authentication
- Validates old password before change
- Validates new password length

#### ✗ MEDIUM: Token Expiration Too Long
- **File:** `backend/src/utils/jwt.ts:24`
- **Issue:** Default expiration: 7 days
- **Risk:** Stolen tokens valid for 7 days; OWASP recommends 15-60 minutes
- **Fix:** Change to `const expiresIn = process.env.JWT_EXPIRATION || '1h';`

#### ✗ HIGH: No Rate Limiting on Auth Endpoints
- **Files:** `backend/src/routes/authRoutes.ts:17` (register), `backend/src/routes/authRoutes.ts:109` (login)
- **Risk:** Brute force attacks, credential stuffing, account enumeration
- **Fix:** Install `express-rate-limit` and apply to `/login` and `/register`

Example:
```typescript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts'
});

router.post('/login', loginLimiter, async (req, res) => { ... });
```

---

## 5. Audit Logging ✗ CRITICAL FAILURE

### Status: Infrastructure defined but NOT implemented

#### Problem:
- **Audit table defined:** ✓ `backend/src/db/schema.sql:195-207`
- **Immutability triggers:** ✓ Present
- **Application logging:** ✗ **MISSING**

No code inserts into `audit_logs` table despite comprehensive schema design.

```bash
$ grep -r "INSERT INTO audit_logs" backend/src/
# No results - audit logging never triggered
```

#### Impact:
- Cannot trace who changed what data
- Regulatory compliance violations
- Inability to investigate security incidents
- **OWASP Violation:** A01:2021 - Broken Access Control

#### Remediation (Required):

**1. Create AuditService:**
```typescript
// backend/src/services/AuditService.ts
export class AuditService {
  constructor(private pool: Pool) {}
  
  async log(auditData: {
    tableName: string;
    recordId: string;
    action: 'INSERT' | 'UPDATE' | 'DELETE';
    userId?: string;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    changeReason?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    const query = `
      INSERT INTO audit_logs 
        (table_name, record_id, action, user_id, old_values, new_values, 
         change_reason, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;
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
  }
}
```

**2. Integrate into UserRepository:**
```typescript
async create(userData): Promise<User> {
  const result = await this.pool.query(query, [...]);
  await this.auditService.log({
    tableName: 'users',
    recordId: result.rows[0].id,
    action: 'INSERT',
    userId: currentUserId,
    newValues: result.rows[0],
    changeReason: 'User created via registration'
  });
  return result.rows[0];
}
```

**3. Apply to all mutation operations (INSERT, UPDATE, DELETE)**

**Estimated Effort:** 4 hours

---

## 6. Sensitive Data & Credentials ✓ MOSTLY SECURE (1 issue)

### Findings:

#### ✓ PASS: .env Files Properly Ignored
- `.gitignore` contains `.env*` pattern
- Pattern: `.env` excludes all environment files
- **Verification:** No `.env` files in git status

#### ✗ HIGH: .env.local Contains Vercel OIDC Token
- **File:** `.env.local`
- **Content:** `VERCEL_OIDC_TOKEN="eyJhbGciOiJSUzI1NiIs..."`
- **Expiration:** 2025-03-13 17:19:36 UTC (~6 months)
- **Risk:** Token provides Vercel deployment access

**Action Required:**
1. Revoke token immediately via Vercel dashboard
2. Generate new token for local development only
3. Create `.env.local.example` template (without secrets)

#### ✓ PASS: No Credentials in Source Code
- No hardcoded passwords found
- No hardcoded API keys found
- No hardcoded secrets

#### ✓ PASS: Password Hash Not Exposed
- `getProfile()` excludes `password_hash`
- API responses never include password hashes

#### ✓ PASS: Error Messages Don't Leak Data
- Login error: "Invalid email or password" (generic)
- Prevents email enumeration
- Development mode shows full errors only when `NODE_ENV === 'development'`

---

## 7. Password Complexity ✗ WEAK

### Current Policy:
- **Minimum length:** 8 characters
- **Other requirements:** None
- **Risk:** Passwords like "password123" or "abcdefgh" are valid

### NIST/OWASP Recommendation:
Implement complexity requirements.

**Fix:**
```typescript
const validatePasswordComplexity = (password: string) => {
  const errors: string[] = [];
  
  if (password.length < 8) errors.push('At least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('At least one uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('At least one lowercase letter');
  if (!/\d/.test(password)) errors.push('At least one number');
  if (!/[!@#$%^&*()_+-=\[\]{};':"\\|,.<>\/?]/.test(password)) 
    errors.push('At least one special character');
  
  return { valid: errors.length === 0, errors };
};
```

---

## 8. Database Security ✓ SECURE

### Findings:

#### ✓ PASS: Database Role-Based Access Control
- `pride_user` role: SELECT, INSERT, UPDATE only
- `pride_user` cannot DELETE (soft deletes only)
- Audit logs: INSERT and SELECT only (no UPDATE/DELETE)

#### ✓ PASS: Immutable Audit Logs
- Database triggers prevent UPDATE
- Database triggers prevent DELETE
- Only INSERT and SELECT allowed

#### ✓ PASS: Foreign Key Constraints
- Proper cascading prevents orphaned records
- Referential integrity maintained

---

## Summary Table

| Category | Status | Issues | Severity |
|----------|--------|--------|----------|
| RBAC Enforcement | SECURE | 1 routing bug | HIGH |
| Input Validation | SECURE | 0 | - |
| SQL Injection | SECURE | 0 | - |
| JWT & Auth | MOSTLY SECURE | 2 | MEDIUM/HIGH |
| Audit Logging | **CRITICAL FAILURE** | 1 | **CRITICAL** |
| Sensitive Data | MOSTLY SECURE | 1 | HIGH |
| Password Complexity | WEAK | 1 | HIGH |
| Database Security | SECURE | 0 | - |

**Total Issues:** 6 (1 CRITICAL, 3 HIGH, 1 MEDIUM, 1 LOW)

---

## Remediation Priority

### IMMEDIATE (Before Production):

1. **Implement Audit Logging** (CRITICAL)
   - Estimated effort: 4 hours
   - Must complete before any production deployment

2. **Add Rate Limiting** (HIGH)
   - Estimated effort: 1 hour
   - Protect against brute force attacks

3. **Revoke Vercel Token** (HIGH)
   - Estimated effort: 15 minutes
   - Prevent unauthorized deployments

4. **Strengthen Password Complexity** (HIGH)
   - Estimated effort: 2 hours
   - Meet security standards

### SHORT TERM (First Sprint):

5. **Fix Analytics Route Priority** (HIGH - Functionality)
   - Estimated effort: 30 minutes
   - Restore cohort analytics endpoint

6. **Shorten JWT Expiration** (MEDIUM)
   - Estimated effort: 3 hours
   - Reduce token theft window

---

## Conclusion

**Overall Risk Assessment: HIGH - Not production-ready**

The PRIDE Training App demonstrates strong foundational security practices:
- ✓ Parameterized SQL (no injection vulnerabilities)
- ✓ Solid JWT implementation  
- ✓ Comprehensive RBAC enforcement
- ✓ Good input validation

However, the **CRITICAL audit logging issue** must be addressed before production deployment. Additionally, three **HIGH severity items** require immediate remediation.

**After remediation: MEDIUM risk** - Good security posture for hospitality training platform.

---

**Reviewed by:** Claude Haiku 4.5  
**Date:** 2026-09-28
