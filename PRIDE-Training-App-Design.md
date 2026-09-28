# Pride Training App — Design Specification

**Date:** 2026-09-28  
**Project:** Digital onboarding & evaluation app for new hires (90-day tracking)  
**Status:** Design approved, ready for implementation planning

---

## Executive Summary

Transform the Pride training log PDF into a mobile-first Progressive Web App (PWA) that lets managers, leads, chefs, and kitchen staff track new hire evaluations in real-time across iOS, Android, and web. The app integrates three evaluation dimensions: **technical skills**, **top 10 soft skills**, and **leadership development** (Thirty Percent Framework), with separate tracks for FOH and BOH teams.

---

## Vision & Goals

**Problem:** PDF-based evaluation requires printing, manual updates, version confusion, and lacks real-time visibility into new hire progress.

**Solution:** Mobile-first app with live updates, smart reminders, analytics, and differentiated FOH/BOH skill tracks.

**Success Criteria:**
- All team members can access evaluations on their phones without app store friction
- Real-time updates sync across team (no stale data)
- Managers see instant alerts on new hires falling behind
- Analytics show progress trends over 90 days
- Offline capability for kitchen environments with spotty connectivity

---

## User Roles & Permissions

| Role | Teams | Permissions |
|------|-------|-------------|
| **New Hire** | Both | View own evaluation, see feedback |
| **FOH Lead** | FOH only | Evaluate FOH new hires |
| **Chef / Sous Chef / Asst. Chef** | BOH only | Evaluate BOH new hires |
| **Asst. Manager** | Both | Evaluate both FOH & BOH, export reports |
| **Manager** | Both | Full access, user management, system config |
| **Admin** | System | Backups, compliance, user provisioning |

---

## Evaluation Framework: Three Dimensions

### 1. Technical Skills (Role-Specific)

**FOH Track:**
- Menu Knowledge (drinks, specials, recommendations)
- Hospitality Standards (5/10 Rule, accurate ordering, repeating orders)
- Cash/Payment Handling (room charges, house cards, Silver Feathers)
- Shift Readiness (pre-shift attention, team interaction)
- POS System Proficiency
- Table Management
- Upselling & Guest Preferences

**BOH Track:**
- Food Safety & Sanitation
- Knife Skills & Prep Work
- Recipe Knowledge & Execution
- Equipment Operation
- Plating & Presentation
- Kitchen Safety
- Inventory Management
- Collaboration with FOH

### 2. Top 10 Soft Skills (Shared)

All new hires (FOH & BOH) are evaluated on:

1. Guest Engagement & Hospitality Mindset — genuine warmth, eye contact, reading the guest's mood
2. Communication Clarity — especially across multilingual, multi-outlet team
3. Adaptability — handling volume swings, menu changes, outlet rotations
4. Teamwork/Collaboration — covering across outlets during rushes
5. Conflict Resolution — de-escalating guest complaints calmly
6. Time Management — hitting speed-of-service standards under pressure
7. Attention to Detail — order accuracy, cash handling, presentation
8. Positive Attitude/Resilience — staying upbeat through long shifts, difficult guests
9. Active Listening — catching special requests, allergies, complaints early
10. Professionalism/Appearance — representing the 4-diamond brand standard

### 3. Leadership Development (Shared Progression Track)

**The Thirty Percent Framework** — 8 modules introduced progressively over 90 days:

| Module | Focus | Timeline |
|--------|-------|----------|
| 1. Leadership Mindset | "I'll Just Do It Myself" | Days 21-35 |
| 2. Emotional Intelligence | "Why Does My Team Keep Tuning Me Out?" | Days 21-35 |
| 3. Time & Priorities | "Building a Business That Doesn't Break You" | Days 36-50 |
| 4. Clear Communication | "The Common Sense Assumption" | Days 36-50 |
| 5. Motivation | "Curing the Bare Minimum Mindset" | Days 51-65 |
| 6. Accountability | "Stop Babysitting, Start Leading" | Days 51-65 |
| 7. Conflict Resolution | "Stop Avoiding and Start Engaging" | Days 66-80 |
| 8. Thriving in the Rush | "Travel Path and Zoning" | Days 81-90 |

**Progression Model:**
- Days 1-20: Focus on Technical Skills + Soft Skills (Guest Engagement, Communication, Teamwork)
- Days 21-50: Introduce Leadership modules 1-4
- Days 51-90: Advanced leadership modules 5-8 + mastery of technical skills

---

## App Architecture & Tech Stack

**Frontend:** React + TypeScript (shared across all platforms)
- Responsive design (mobile-first)
- TailwindCSS for styling
- React Router for navigation
- Offline-capable with Service Workers

**Backend:** Node.js + Express
- RESTful API (or GraphQL for real-time updates)
- JWT authentication
- Role-based access control (RBAC)

**Database:** PostgreSQL
- Encrypted at rest
- Automatic daily backups
- Audit logging (who changed what, when)

**Infrastructure:**
- Web hosting: Vercel (auto-deployments)
- PWA served from same web app
- No app store friction — install from browser home screen

---

## App Structure & Screens

### 1. Dashboard / Home
- List all active new hires
- Progress bar (% through 90 days)
- Quick status indicators (sections needing updates)
- Tap to open evaluation

### 2. New Hire Evaluation (Main Form)
- Tabbed interface: Skills | Soft Skills | Leadership | Strengths | Areas for Improvement | Trainer Notes
- Real-time save as user types
- Last updated timestamp & by whom
- Comments on individual skills
- Role-specific sections (FOH vs BOH)

### 3. Analytics / Progress View
- Progress timeline (days 1-90 with milestones)
- Skill heat map (red/yellow/green/blue proficiency)
- Radar chart (strengths vs. growth areas)
- Weekly trend line
- Comparison to peer cohorts (anonymized)
- Leadership module completion timeline

### 4. Team / Admin View (Manager only)
- All active new hires overview
- Color-coded status
- Risk alerts (falling behind)
- Export to PDF (official 90-day report)
- Cohort analytics

### 5. Settings
- User profile & password
- Notification preferences
- Role & team assignment

---

## Data Model

**New Hire Record:**
```
{
  id: UUID,
  name: string,
  role: "FOH" | "BOH",
  start_date: date,
  created_by: user_id,
  status: "active" | "completed" | "on-hold",
  technical_skills: [
    { skill_id, rating: 1-5, last_updated: timestamp, updated_by: user_id, notes: string }
  ],
  soft_skills: [
    { skill_id, rating: 1-5, last_updated: timestamp, updated_by: user_id }
  ],
  leadership_modules: [
    { module_id, status: "not_started" | "in_progress" | "completed", 
      reflection_notes: string, completed_date: date }
  ],
  strengths: string,
  areas_for_improvement: string,
  trainer_notes: string,
  audit_log: [ { timestamp, user_id, action, changes } ]
}
```

---

## Data Sync & Offline Support

**Real-Time Sync:**
- Changes saved immediately to database (when online)
- All devices see updates in real-time
- Offline changes queue locally, sync when connectivity returns
- Conflict resolution: last-write-wins with audit trail

**Offline Capability:**
- Service Workers cache essential data
- Users can view/edit forms while offline
- Kitchen staff with spotty connectivity supported
- Auto-sync when connection restores

---

## Notifications & Reminders

**Smart Reminders:**
- Weekly check-in prompt (default: Monday morning)
- Milestone alerts (days 30, 60, 90)
- Overdue updates (if skill hasn't changed in 2 weeks)
- Manager alerts (team members behind on updates)

**Customization:**
- FOH/BOH teams set independent reminder frequency
- Quiet hours (no notifications during service)
- In-app + optional push notifications

**Milestones:**
- Visual badges when new hire completes a module
- Team morale notifications ("New hire just mastered Menu Knowledge!")

---

## Analytics & Reporting

**New Hire Dashboard:**
- Progress timeline with milestones
- Skill heat map (proficiency status)
- Radar chart (technical vs. soft vs. leadership)
- Weekly improvement trend
- Peer comparison (anonymized)

**Manager Dashboard:**
- Team overview (all new hires, color-coded status)
- Risk alerts (falling behind)
- Cohort trends (patterns across multiple new hires)
- Export to PDF (official 90-day evaluation report)

**Leadership Module View:**
- Timeline of completed modules
- Reflection notes & takeaways
- Growth correlation with skill improvements

---

## Security & Compliance

**Authentication:**
- Email + password (bcrypt hashed)
- Optional 2FA for managers
- Session timeout after 15 minutes inactivity

**Authorization:**
- Role-based access control (RBAC)
- FOH staff see FOH evaluations only
- BOH staff see BOH evaluations only
- Managers see both + system admin functions

**Data Protection:**
- HTTPS/TLS in transit
- AES-256 encryption at rest
- Automatic daily backups
- Audit logging (immutable record of all changes)
- GDPR-compliant data retention policies

---

## Implementation Timeline

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| **Backend Setup** | Weeks 1-4 | API, database schema, auth, RBAC |
| **Frontend (Web + Mobile UI)** | Weeks 5-8 | All screens, offline support, PWA setup |
| **Integration & Testing** | Weeks 9-11 | E2E tests, performance, security audit |
| **Launch Prep** | Week 12 | Team training, data migration, go-live |

**Total:** 12 weeks (3 months)

---

## Deployment Strategy

**Web App:**
- Vercel (auto-deploy on code push)
- Zero-downtime deployments
- Built-in analytics & monitoring

**PWA (Mobile):**
- Served from same React app
- Users install from browser → home screen app
- Auto-updates when new version deployed
- Works offline with Service Workers

**Data Migration:**
- Import existing new hires from PDF/spreadsheet
- One-time setup by admin
- No downtime during transition

---

## Success Metrics

1. **Adoption:** 90% of team using app within first month
2. **Engagement:** Weekly update rate > 80%
3. **Data Quality:** 95%+ of evaluations completed by day 90
4. **Manager Satisfaction:** Managers report better visibility into new hire progress
5. **Time Savings:** Evaluation process 40% faster than PDF workflow
6. **Retention Insight:** Correlate soft skills/leadership growth with long-term retention

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Low mobile adoption in kitchen | Push notifications, habit-building during onboarding, make it faster than PDF |
| Data entry burden | Auto-save, smart defaults, progress indicators to motivate completion |
| Offline connectivity issues | Service Workers, local queue, auto-sync when online |
| Role confusion (FOH vs BOH access) | Clear labeling, on-screen role display, training |

---

## Open Questions for Refinement

- Should we sync leadership module completion with completion certificates?
- Do you want email summaries of weekly progress sent to managers?
- Should new hires see feedback in real-time, or only at 30/60/90-day milestones?
- Any integration needed with payroll/HR systems?

---

## Next Steps

1. **Your Review:** Please review this spec and confirm it matches your vision
2. **Implementation Planning:** Invoke writing-plans skill to create detailed task breakdown
3. **Development:** Begin backend API + database setup

