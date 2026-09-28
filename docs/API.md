# PRIDE Training App - API Documentation

## Overview

The PRIDE Training App API provides a comprehensive REST interface for managing new hire onboarding evaluations, tracking 90-day progress, and analyzing team performance. All endpoints require authentication via JWT tokens except for public registration.

**Base URL:** `https://your-api-domain.com/api` (or `http://localhost:3001/api` in development)

**Authentication:** Bearer token in `Authorization` header
```
Authorization: Bearer <jwt-token>
```

**Response Format:** All responses are JSON with timestamp and standard error structure:
```json
{
  "status": "success|error",
  "data": { ... },
  "timestamp": "2026-09-28T12:00:00Z"
}
```

---

## Authentication Endpoints

### POST /auth/register
Register a new user (public, no auth required). All registrations default to `new_hire` role.

**Rate Limit:** 5 attempts per 15 minutes per IP

**Request Body:**
```json
{
  "email": "string (required, unique)",
  "password": "string (required, min 8 chars, must contain uppercase, lowercase, number, special char)",
  "firstName": "string (required)",
  "lastName": "string (required)",
  "phone": "string (optional)"
}
```

**Success Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid",
    "email": "john.doe@company.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "new_hire",
    "team": null,
    "createdAt": "2026-09-28T12:00:00Z"
  },
  "timestamp": "2026-09-28T12:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request` — Missing required fields
- `409 Conflict` — Email already registered
- `422 Unprocessable Entity` — Password does not meet requirements

---

### POST /auth/admin/create-user
Create a user with privileged roles (admin only).

**Required Role:** `admin`

**Request Body:**
```json
{
  "email": "string (required, unique)",
  "password": "string (required, min 8 chars)",
  "firstName": "string (required)",
  "lastName": "string (required)",
  "role": "string (required) — 'manager', 'asst_manager', 'lead', or 'chef'",
  "team": "string (optional) — 'FOH' or 'BOH'",
  "phone": "string (optional)"
}
```

**Success Response (201):**
```json
{
  "token": "...",
  "user": { ... },
  "timestamp": "2026-09-28T12:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request` — Missing required fields
- `401 Unauthorized` — Not authenticated
- `403 Forbidden` — Not admin
- `409 Conflict` — Email already exists

---

### POST /auth/login
Authenticate user and receive JWT token.

**Rate Limit:** 5 attempts per 15 minutes per IP

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid",
    "email": "john.doe@company.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "manager",
    "team": "FOH",
    "createdAt": "2026-09-28T00:00:00Z"
  },
  "timestamp": "2026-09-28T12:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request` — Missing email or password
- `401 Unauthorized` — Invalid credentials
- `429 Too Many Requests` — Rate limit exceeded

---

### POST /auth/change-password
Change authenticated user's password.

**Required Auth:** Yes

**Request Body:**
```json
{
  "currentPassword": "string (required)",
  "newPassword": "string (required, min 8 chars)"
}
```

**Success Response (200):**
```json
{
  "message": "Password changed successfully",
  "timestamp": "2026-09-28T12:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request` — Missing fields or invalid password
- `401 Unauthorized` — Current password incorrect or not authenticated

---

### POST /auth/reset-password
Reset user password (admin only).

**Required Role:** `admin`

**Request Body:**
```json
{
  "userId": "string (required)",
  "newPassword": "string (required)"
}
```

**Success Response (200):**
```json
{
  "message": "Password reset successfully",
  "timestamp": "2026-09-28T12:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request` — Missing fields
- `401 Unauthorized` — Not authenticated
- `403 Forbidden` — Not admin

---

### GET /auth/profile
Fetch current authenticated user's profile.

**Required Auth:** Yes

**Success Response (200):**
```json
{
  "user": {
    "id": "user-uuid",
    "email": "john.doe@company.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "manager",
    "team": "FOH",
    "createdAt": "2026-09-28T00:00:00Z"
  },
  "timestamp": "2026-09-28T12:00:00Z"
}
```

**Error Responses:**
- `401 Unauthorized` — Not authenticated
- `404 Not Found` — Profile not found
- `500 Internal Server Error` — Database error

---

## New Hires Management Endpoints

### GET /new-hires
List all new hires with team-based filtering.

**Required Auth:** Yes

**Query Parameters:**
- `department` — Filter by 'FOH' or 'BOH' (optional; non-managers only see their own team)
- `is_active` — Filter by active status true/false (default: true)

**Role Access:**
- Admins, Managers: See all teams
- Regular Staff: See only their own team

**Success Response (200):**
```json
[
  {
    "id": "hire-uuid",
    "firstName": "Jane",
    "lastName": "Smith",
    "department": "FOH",
    "startDate": "2026-09-01T00:00:00Z",
    "targetCompletionDate": "2026-11-30T00:00:00Z",
    "daysElapsed": 27,
    "completionPercentage": 30,
    "isActive": true,
    "createdAt": "2026-09-01T00:00:00Z"
  }
]
```

**Error Responses:**
- `401 Unauthorized` — Not authenticated
- `403 Forbidden` — Trying to access other team's data
- `400 Bad Request` — Invalid filters

---

### GET /new-hires/:id
Fetch a single new hire record with full details.

**Required Auth:** Yes

**Success Response (200):**
```json
{
  "id": "hire-uuid",
  "firstName": "Jane",
  "lastName": "Smith",
  "department": "FOH",
  "startDate": "2026-09-01T00:00:00Z",
  "targetCompletionDate": "2026-11-30T00:00:00Z",
  "daysElapsed": 27,
  "completionPercentage": 30,
  "isActive": true,
  "notes": "Quick learner, good communication",
  "createdAt": "2026-09-01T00:00:00Z",
  "updatedAt": "2026-09-28T12:00:00Z"
}
```

**Error Responses:**
- `401 Unauthorized` — Not authenticated
- `403 Forbidden` — Not authorized to view this hire
- `404 Not Found` — New hire not found

---

### POST /new-hires
Create a new hire record (manager/admin only).

**Required Role:** `manager`, `asst_manager`, or `admin`

**Request Body:**
```json
{
  "firstName": "string (required)",
  "lastName": "string (required)",
  "department": "string (required) — 'FOH' or 'BOH'",
  "startDate": "ISO date (required)",
  "targetCompletionDate": "ISO date (required) — 90 days after startDate",
  "notes": "string (optional)"
}
```

**Success Response (201):**
```json
{
  "id": "hire-uuid",
  "firstName": "Jane",
  "lastName": "Smith",
  "department": "FOH",
  "startDate": "2026-09-01T00:00:00Z",
  "targetCompletionDate": "2026-11-30T00:00:00Z",
  "daysElapsed": 0,
  "completionPercentage": 0,
  "isActive": true,
  "createdAt": "2026-09-28T12:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request` — Missing fields or invalid dates
- `401 Unauthorized` — Not authenticated
- `403 Forbidden` — Insufficient role

---

### PUT /new-hires/:id
Update a new hire record (manager/admin only).

**Required Role:** `manager`, `asst_manager`, or `admin`

**Request Body:** (all optional)
```json
{
  "firstName": "string",
  "lastName": "string",
  "notes": "string",
  "isActive": "boolean"
}
```

**Success Response (200):**
```json
{
  "id": "hire-uuid",
  "firstName": "Jane",
  "lastName": "Smith",
  ...
}
```

**Error Responses:**
- `400 Bad Request` — Invalid data
- `401 Unauthorized` — Not authenticated
- `403 Forbidden` — Insufficient role
- `404 Not Found` — New hire not found

---

### DELETE /new-hires/:id
Soft-delete (mark inactive) a new hire record (manager/admin only).

**Required Role:** `manager`, `asst_manager`, or `admin`

**Success Response (204 No Content)**

**Error Responses:**
- `401 Unauthorized` — Not authenticated
- `403 Forbidden` — Insufficient role
- `404 Not Found` — New hire not found

---

## Evaluations Endpoints

### GET /evaluations/:newHireId
Fetch all skill ratings for a new hire.

**Required Auth:** Yes

**Role Access:**
- Admins, Managers: View all new hires
- Team Staff: View only own team new hires

**Success Response (200):**
```json
{
  "newHireId": "hire-uuid",
  "totalRatings": 12,
  "ratings": [
    {
      "id": "rating-uuid",
      "skillName": "Order Accuracy",
      "category": "technical",
      "rating": 4,
      "notes": "Needs practice with complex orders",
      "ratedBy": "user-uuid",
      "ratedByName": "John Manager",
      "createdAt": "2026-09-25T10:30:00Z"
    },
    {
      "id": "rating-uuid",
      "skillName": "Communication",
      "category": "soft_skill",
      "rating": 5,
      "notes": "Excellent with guests",
      "ratedBy": "user-uuid",
      "ratedByName": "Jane Lead",
      "createdAt": "2026-09-26T14:15:00Z"
    }
  ],
  "timestamp": "2026-09-28T12:00:00Z"
}
```

**Error Responses:**
- `401 Unauthorized` — Not authenticated
- `403 Forbidden` — Not authorized to view
- `404 Not Found` — New hire not found

---

### POST /evaluations/skills
Rate a technical or soft skill for a new hire.

**Required Auth:** Yes (team-based RBAC)

**Request Body:**
```json
{
  "newHireId": "string (required)",
  "skillName": "string (required) — e.g., 'Order Accuracy', 'Communication'",
  "category": "string (required) — 'technical' or 'soft_skill'",
  "rating": "integer (required) — 1-5 scale",
  "notes": "string (optional)"
}
```

**Success Response (201 or 200):**
```json
{
  "id": "rating-uuid",
  "newHireId": "hire-uuid",
  "skillName": "Order Accuracy",
  "category": "technical",
  "rating": 4,
  "notes": "Needs practice with complex orders",
  "ratedBy": "user-uuid",
  "ratedByName": "John Manager",
  "createdAt": "2026-09-28T12:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request` — Missing fields or invalid rating (must be 1-5)
- `401 Unauthorized` — Not authenticated
- `403 Forbidden` — Not authorized for this team
- `404 Not Found` — New hire not found

---

### POST /evaluations/leadership/:newHireId/:moduleId
Mark a leadership module as complete for a new hire.

**Required Role:** `manager`, `asst_manager`

**URL Parameters:**
- `newHireId` — UUID of the new hire
- `moduleId` — ID of the leadership module (1-5 for Five Pillars framework)

**Request Body:**
```json
{
  "completedDate": "ISO date (optional, defaults to now)"
}
```

**Success Response (200):**
```json
{
  "newHireId": "hire-uuid",
  "moduleId": 1,
  "moduleName": "Emotional Intelligence",
  "completedDate": "2026-09-28T12:00:00Z",
  "completedBy": "manager-uuid",
  "timestamp": "2026-09-28T12:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request` — Invalid moduleId
- `401 Unauthorized` — Not authenticated
- `403 Forbidden` — Not manager/asst_manager
- `404 Not Found` — New hire or module not found

---

### PUT /evaluations/summary/:newHireId
Update overall evaluation summary for a new hire (team lead/manager).

**Required Auth:** Yes (team-based RBAC)

**Request Body:**
```json
{
  "overallStatus": "string (optional) — 'on_track', 'needs_support', 'exceeding'",
  "summaryNotes": "string (optional)"
}
```

**Success Response (200):**
```json
{
  "newHireId": "hire-uuid",
  "overallStatus": "on_track",
  "summaryNotes": "Jane is progressing well. Ready to handle solo shifts.",
  "lastUpdatedBy": "manager-uuid",
  "timestamp": "2026-09-28T12:00:00Z"
}
```

**Error Responses:**
- `401 Unauthorized` — Not authenticated
- `403 Forbidden` — Not authorized
- `404 Not Found` — New hire not found

---

## Analytics Endpoints

### GET /analytics/cohort/summary
Fetch cohort-level analytics for a department (managers/admins only).

**Required Role:** `manager`, `admin`

**Query Parameters:**
- `department` — 'FOH' or 'BOH' (default: FOH)

**Caching:** 1 minute (`Cache-Control: max-age=60`)

**Success Response (200):**
```json
{
  "department": "FOH",
  "total_members": 8,
  "members": [
    {
      "id": "hire-uuid",
      "firstName": "Jane",
      "lastName": "Smith",
      "completionPercentage": 30,
      "averageSkillRating": 4.2,
      "daysElapsed": 27,
      "leadershipModulesCompleted": 2,
      "overallStatus": "on_track"
    },
    {
      "id": "hire-uuid",
      "firstName": "John",
      "lastName": "Doe",
      "completionPercentage": 50,
      "averageSkillRating": 3.8,
      "daysElapsed": 45,
      "leadershipModulesCompleted": 3,
      "overallStatus": "on_track"
    }
  ],
  "cohortStats": {
    "averageCompletionPercentage": 40,
    "averageSkillRating": 4.0,
    "averageLeadershipProgress": 2.5
  },
  "timestamp": "2026-09-28T12:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request` — Invalid department
- `401 Unauthorized` — Not authenticated
- `403 Forbidden` — Not manager/admin

---

### GET /analytics/:newHireId
Fetch progress metrics and analytics for a single new hire.

**Required Auth:** Yes

**Role Access:**
- Admins, Managers: View all new hires
- Team Staff: View only own team new hires

**Caching:** 5 minutes (`Cache-Control: max-age=300`)

**Success Response (200):**
```json
{
  "newHireId": "hire-uuid",
  "firstName": "Jane",
  "lastName": "Smith",
  "department": "FOH",
  "daysElapsed": 27,
  "daysRemaining": 63,
  "completionPercentage": 30,
  "skillMetrics": {
    "totalRatings": 12,
    "averageRating": 4.2,
    "ratingsByCategory": {
      "technical": {
        "count": 7,
        "average": 3.9
      },
      "soft_skill": {
        "count": 5,
        "average": 4.6
      }
    },
    "skillTrend": [
      {
        "week": 1,
        "average": 3.5
      },
      {
        "week": 2,
        "average": 3.8
      },
      {
        "week": 3,
        "average": 4.1
      },
      {
        "week": 4,
        "average": 4.2
      }
    ]
  },
  "leadershipProgress": {
    "modulesCompleted": 2,
    "modulesRemaining": 3,
    "completedModules": [
      {
        "id": 1,
        "name": "Emotional Intelligence",
        "completedDate": "2026-09-15T00:00:00Z"
      },
      {
        "id": 2,
        "name": "Decisiveness",
        "completedDate": "2026-09-22T00:00:00Z"
      }
    ]
  },
  "cohortComparison": {
    "cohortAverageRating": 4.0,
    "userAboveAverage": true,
    "percentageAboveCohort": 105
  },
  "timestamp": "2026-09-28T12:00:00Z"
}
```

**Error Responses:**
- `401 Unauthorized` — Not authenticated
- `403 Forbidden` — Not authorized
- `404 Not Found` — New hire not found
- `500 Internal Server Error` — Database error

---

## System Endpoints

### GET /health
Health check endpoint (no auth required).

**Success Response (200):**
```json
{
  "status": "healthy",
  "database": "connected",
  "uptime": 3600.5,
  "timestamp": "2026-09-28T12:00:00Z"
}
```

**Error Response (503):**
```json
{
  "status": "unhealthy",
  "database": "disconnected",
  "error": "Connection timeout",
  "timestamp": "2026-09-28T12:00:00Z"
}
```

---

## Error Responses

### Standard Error Format
All error responses follow this structure:

```json
{
  "error": "Error Category",
  "message": "Human-readable error message",
  "timestamp": "2026-09-28T12:00:00Z"
}
```

### HTTP Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| `400` | Bad Request | Missing fields, invalid format, validation errors |
| `401` | Unauthorized | Missing or invalid JWT token |
| `403` | Forbidden | Insufficient permissions or role |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Email already exists, duplicate unique constraint |
| `422` | Unprocessable Entity | Password doesn't meet requirements |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Unexpected server error |
| `503` | Service Unavailable | Database unreachable |

---

## Rate Limiting

### Authentication Endpoints
- **Limit:** 5 attempts per 15 minutes per IP
- **Headers:** `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`
- **Endpoints Affected:**
  - POST /auth/register
  - POST /auth/login

### Exemptions
- Requests with valid authentication token (already logged in)
- Health check endpoint

---

## JWT Token Structure

Tokens are JWT (JSON Web Tokens) signed with HS256. Claims include:

```json
{
  "userId": "uuid",
  "email": "user@company.com",
  "role": "manager",
  "team": "FOH",
  "iat": 1695868800,
  "exp": 1695955200
}
```

**Token Expiration:** 24 hours from issuance

**Refresh Strategy:** Re-login to get a new token (no refresh token endpoint)

---

## Pagination & Filtering

Most list endpoints support pagination and filtering:

**Query Parameters (for future implementation):**
- `page` — Page number (default: 1)
- `limit` — Items per page (default: 20, max: 100)
- `sortBy` — Field to sort by
- `sortOrder` — 'asc' or 'desc'
- `search` — Free-text search (on applicable fields)

---

## Date Format

All timestamps are in ISO 8601 format with timezone:
```
2026-09-28T12:00:00Z
```

---

## Examples

### Complete Evaluation Workflow

#### 1. Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane.lead@company.com",
    "password": "SecurePass123!"
  }'
```

#### 2. List New Hires
```bash
curl -X GET http://localhost:3001/api/new-hires \
  -H "Authorization: Bearer <token>"
```

#### 3. Rate a Skill
```bash
curl -X POST http://localhost:3001/api/evaluations/skills \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "newHireId": "hire-uuid",
    "skillName": "Order Accuracy",
    "category": "technical",
    "rating": 4,
    "notes": "Needs practice with complex orders"
  }'
```

#### 4. View Analytics
```bash
curl -X GET http://localhost:3001/api/analytics/hire-uuid \
  -H "Authorization: Bearer <token>"
```

---

## Support

For API issues or questions, contact the development team or file a GitHub issue.
