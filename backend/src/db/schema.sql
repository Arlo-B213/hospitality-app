-- PRIDE Training App Database Schema
-- PostgreSQL 14+
-- All passwords hashed with bcrypt (min 12 rounds)
-- All queries parameterized (no SQL injection)
-- All IDs use UUID for security and scalability
-- Audit logs are immutable (INSERT-only)

-- PostgreSQL 14+ uses gen_random_uuid() built-in for UUID generation (no extension needed)

-- Create enum types for roles and statuses
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'asst_manager', 'foh_lead', 'chef', 'sous_chef', 'asst_chef', 'new_hire');
CREATE TYPE department_type AS ENUM ('FOH', 'BOH');
CREATE TYPE evaluation_status AS ENUM ('not_started', 'in_progress', 'completed', 'archived');
CREATE TYPE skill_proficiency AS ENUM ('novice', 'beginner', 'intermediate', 'advanced', 'expert');

-- Users table
-- Stores system users with roles and permissions
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role user_role NOT NULL DEFAULT 'new_hire',
  team VARCHAR(10),
  phone VARCHAR(20),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  CONSTRAINT valid_email CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
  CONSTRAINT valid_team CHECK (team IS NULL OR team IN ('FOH', 'BOH'))
);

-- New Hires table
-- Tracks new hire onboarding journey
CREATE TABLE new_hires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  department department_type NOT NULL,
  start_date DATE NOT NULL,
  day_90_target_date DATE NOT NULL,
  hire_manager_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_dates CHECK (day_90_target_date > start_date)
);

-- Technical Skills Master Table
-- Defines FOH and BOH specific technical skills (15 total: 7 FOH + 8 BOH)
CREATE TABLE technical_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_name VARCHAR(150) NOT NULL UNIQUE,
  description TEXT,
  department department_type NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Pre-populate technical skills for FOH and BOH (from spec: Design doc lines 45-64)
INSERT INTO technical_skills (skill_name, description, department) VALUES
-- FOH Skills (7 total)
('Menu Knowledge', 'Drinks, specials, recommendations knowledge', 'FOH'),
('Hospitality Standards', '5/10 Rule, accurate ordering, repeating orders', 'FOH'),
('Cash/Payment Handling', 'Room charges, house cards, Silver Feathers', 'FOH'),
('Shift Readiness', 'Pre-shift attention, team interaction', 'FOH'),
('POS System Proficiency', 'Point-of-sale system competency', 'FOH'),
('Table Management', 'Table assignments and flow management', 'FOH'),
('Upselling & Guest Preferences', 'Upselling and recognizing guest preferences', 'FOH'),
-- BOH Skills (8 total)
('Food Safety & Sanitation', 'Food safety protocols and hygiene practices', 'BOH'),
('Knife Skills & Prep Work', 'Cutting techniques and ingredient preparation', 'BOH'),
('Recipe Knowledge & Execution', 'Recipe adherence and dish execution', 'BOH'),
('Equipment Operation', 'Kitchen equipment operation and maintenance', 'BOH'),
('Plating & Presentation', 'Food plating and dish presentation standards', 'BOH'),
('Kitchen Safety', 'Kitchen safety protocols and hazard awareness', 'BOH'),
('Inventory Management', 'Food inventory tracking and management', 'BOH'),
('Collaboration with FOH', 'Teamwork and communication with front-of-house', 'BOH');

-- Soft Skills Master Table
-- 10 shared soft skills across all employees (from spec: Design doc lines 66-79)
CREATE TABLE soft_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_name VARCHAR(150) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Pre-populate exactly 10 soft skills from spec
INSERT INTO soft_skills (skill_name, description) VALUES
('Guest Engagement & Hospitality Mindset', 'Genuine warmth, eye contact, reading the guest''s mood'),
('Communication Clarity', 'Especially across multilingual, multi-outlet team'),
('Adaptability', 'Handling volume swings, menu changes, outlet rotations'),
('Teamwork/Collaboration', 'Covering across outlets during rushes'),
('Conflict Resolution', 'De-escalating guest complaints calmly'),
('Time Management', 'Hitting speed-of-service standards under pressure'),
('Attention to Detail', 'Order accuracy, cash handling, presentation'),
('Positive Attitude/Resilience', 'Staying upbeat through long shifts, difficult guests'),
('Active Listening', 'Catching special requests, allergies, complaints early'),
('Professionalism/Appearance', 'Representing the 4-diamond brand standard');

-- Leadership Modules Master Table
-- 8 leadership modules from "Thirty Percent Framework" (from spec: Design doc lines 83-94)
CREATE TABLE leadership_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_name VARCHAR(150) NOT NULL UNIQUE,
  description TEXT,
  module_sequence INTEGER NOT NULL UNIQUE,
  start_day INTEGER NOT NULL,
  end_day INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_day_range CHECK (end_day >= start_day),
  CONSTRAINT valid_day_range_90 CHECK (start_day >= 1 AND end_day <= 90)
);

-- Pre-populate 8 leadership modules from Thirty Percent Framework
INSERT INTO leadership_modules (module_name, description, module_sequence, start_day, end_day) VALUES
('Leadership Mindset', '"I''ll Just Do It Myself"', 1, 21, 35),
('Emotional Intelligence', '"Why Does My Team Keep Tuning Me Out?"', 2, 21, 35),
('Time & Priorities', '"Building a Business That Doesn''t Break You"', 3, 36, 50),
('Clear Communication', '"The Common Sense Assumption"', 4, 36, 50),
('Motivation', '"Curing the Bare Minimum Mindset"', 5, 51, 65),
('Accountability', '"Stop Babysitting, Start Leading"', 6, 51, 65),
('Conflict Resolution', '"Stop Avoiding and Start Engaging"', 7, 66, 80),
('Thriving in the Rush', '"Travel Path and Zoning"', 8, 81, 90);

-- Skill Assessments Table
-- Tracks assessment of technical skills and soft skills for new hires
-- Note: skill_id validation is enforced via trigger (CHECK constraint cannot use subqueries)
CREATE TABLE skill_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  new_hire_id UUID NOT NULL REFERENCES new_hires(id) ON DELETE CASCADE,
  skill_type VARCHAR(20) NOT NULL CHECK (skill_type IN ('technical', 'soft')),
  skill_id UUID NOT NULL,
  assessor_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  proficiency_level skill_proficiency NOT NULL,
  comments TEXT,
  assessment_date DATE NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Leadership Module Progress Table
-- Tracks progress through 8 leadership modules
CREATE TABLE leadership_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  new_hire_id UUID NOT NULL REFERENCES new_hires(id) ON DELETE CASCADE,
  leadership_module_id UUID NOT NULL REFERENCES leadership_modules(id) ON DELETE RESTRICT,
  start_date DATE,
  completion_date DATE,
  status evaluation_status NOT NULL DEFAULT 'not_started',
  mentor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  progress_notes TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_leadership_dates CHECK (completion_date IS NULL OR completion_date >= start_date)
);

-- Evaluation Summaries Table
-- Overall evaluation summary for each new hire at different milestones
CREATE TABLE evaluation_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  new_hire_id UUID NOT NULL REFERENCES new_hires(id) ON DELETE CASCADE,
  evaluation_type VARCHAR(50) NOT NULL CHECK (evaluation_type IN ('30_day', '60_day', '90_day', 'final')),
  evaluator_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  overall_rating skill_proficiency NOT NULL,
  technical_skills_average NUMERIC(3, 2) CHECK (technical_skills_average >= 0 AND technical_skills_average <= 5),
  soft_skills_average NUMERIC(3, 2) CHECK (soft_skills_average >= 0 AND soft_skills_average <= 5),
  leadership_progress_average NUMERIC(3, 2) CHECK (leadership_progress_average >= 0 AND leadership_progress_average <= 5),
  strengths TEXT,
  areas_for_improvement TEXT,
  action_items TEXT,
  status evaluation_status NOT NULL DEFAULT 'not_started',
  evaluation_date DATE NOT NULL,
  due_date DATE NOT NULL,
  is_submitted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_evaluation_per_milestone UNIQUE (new_hire_id, evaluation_type)
);

-- Audit Logs Table
-- IMMUTABLE comprehensive audit trail for all data modifications
-- INSERT-only table: no UPDATE or DELETE allowed (enforced by trigger)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name VARCHAR(100) NOT NULL,
  record_id UUID NOT NULL,
  action VARCHAR(10) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  old_values JSONB,
  new_values JSONB,
  change_reason TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance optimization
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_new_hires_user_id ON new_hires(user_id);
CREATE INDEX idx_new_hires_hire_manager_id ON new_hires(hire_manager_id);
CREATE INDEX idx_new_hires_department ON new_hires(department);
CREATE INDEX idx_new_hires_is_active ON new_hires(is_active);
CREATE INDEX idx_skill_assessments_new_hire_id ON skill_assessments(new_hire_id);
CREATE INDEX idx_skill_assessments_assessor_id ON skill_assessments(assessor_id);
CREATE INDEX idx_skill_assessments_assessment_date ON skill_assessments(assessment_date);
CREATE INDEX idx_leadership_progress_new_hire_id ON leadership_progress(new_hire_id);
CREATE INDEX idx_leadership_progress_status ON leadership_progress(status);
CREATE INDEX idx_evaluation_summaries_new_hire_id ON evaluation_summaries(new_hire_id);
CREATE INDEX idx_evaluation_summaries_evaluation_type ON evaluation_summaries(evaluation_type);
CREATE INDEX idx_evaluation_summaries_status ON evaluation_summaries(status);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_record_id_table ON audit_logs(table_name, record_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables with updated_at column
CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_new_hires_updated_at
  BEFORE UPDATE ON new_hires
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_technical_skills_updated_at
  BEFORE UPDATE ON technical_skills
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_soft_skills_updated_at
  BEFORE UPDATE ON soft_skills
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_leadership_modules_updated_at
  BEFORE UPDATE ON leadership_modules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_skill_assessments_updated_at
  BEFORE UPDATE ON skill_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_leadership_progress_updated_at
  BEFORE UPDATE ON leadership_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_evaluation_summaries_updated_at
  BEFORE UPDATE ON evaluation_summaries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger function for skill_id validation (CHECK constraint cannot use subqueries)
CREATE OR REPLACE FUNCTION validate_skill_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate that skill_id exists in the correct table based on skill_type
  IF NEW.skill_type = 'technical' THEN
    IF NOT EXISTS (SELECT 1 FROM technical_skills WHERE id = NEW.skill_id) THEN
      RAISE EXCEPTION 'Invalid technical_skill_id: skill does not exist in technical_skills table';
    END IF;
  ELSIF NEW.skill_type = 'soft' THEN
    IF NOT EXISTS (SELECT 1 FROM soft_skills WHERE id = NEW.skill_id) THEN
      RAISE EXCEPTION 'Invalid soft_skill_id: skill does not exist in soft_skills table';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply skill_id validation trigger to skill_assessments
CREATE TRIGGER trigger_skill_assessments_validate_skill_id
  BEFORE INSERT OR UPDATE ON skill_assessments
  FOR EACH ROW
  EXECUTE FUNCTION validate_skill_id();

-- Create immutability trigger for audit_logs (INSERT-only, no UPDATE/DELETE)
CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs are immutable: UPDATE and DELETE operations are not allowed';
END;
$$ LANGUAGE plpgsql;

-- Enforce immutability: reject any UPDATE attempts on audit_logs
CREATE TRIGGER trigger_audit_logs_prevent_update
  BEFORE UPDATE ON audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_log_modification();

-- Enforce immutability: reject any DELETE attempts on audit_logs
CREATE TRIGGER trigger_audit_logs_prevent_delete
  BEFORE DELETE ON audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_log_modification();

-- Grant appropriate permissions to app role (pride_user)
-- Audit logs are INSERT and SELECT only; UPDATE/DELETE prevented by triggers
GRANT SELECT, INSERT, UPDATE ON users TO pride_user;
GRANT SELECT, INSERT, UPDATE ON new_hires TO pride_user;
GRANT SELECT, INSERT, UPDATE ON technical_skills TO pride_user;
GRANT SELECT, INSERT, UPDATE ON soft_skills TO pride_user;
GRANT SELECT, INSERT, UPDATE ON leadership_modules TO pride_user;
GRANT SELECT, INSERT, UPDATE ON skill_assessments TO pride_user;
GRANT SELECT, INSERT, UPDATE ON leadership_progress TO pride_user;
GRANT SELECT, INSERT, UPDATE ON evaluation_summaries TO pride_user;
GRANT INSERT, SELECT ON audit_logs TO pride_user;  -- INSERT and SELECT only
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO pride_user;
