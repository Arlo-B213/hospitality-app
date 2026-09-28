# PRIDE Training App - Data Migration Guide

Complete guide for importing new hire data and initializing the PRIDE Training App database.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Database Initialization](#database-initialization)
3. [CSV Import](#csv-import)
4. [JSON Import](#json-import)
5. [Data Format Specifications](#data-format-specifications)
6. [Troubleshooting](#troubleshooting)
7. [Advanced Usage](#advanced-usage)

---

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- PostgreSQL 14+ running
- Database credentials configured in `.env` or `DATABASE_URL` environment variable

### First Time Setup

```bash
# 1. Initialize database (create tables, seed sample data, create admin user)
npm run init:db

# You'll be prompted for an admin password, or provide as argument:
npm run init:db "YourSecurePassword123!"

# 2. (Optional) Import additional new hire data from CSV or JSON
npm run import:csv data/new-hires.csv
npm run import:json data/new-hires.json
```

---

## Database Initialization

### Overview

The `init:db` script creates all database tables, establishes relationships, seeds sample data, and creates an admin user account.

### What It Does

1. **Creates Database Schema**
   - Users table with authentication fields
   - New hires tracking table
   - Technical skills (FOH/BOH specific)
   - Soft skills (shared across all roles)
   - Leadership modules (8-module Thirty Percent Framework)
   - Skill assessments table
   - Leadership progress tracking
   - Evaluation summaries
   - Audit logs (immutable)

2. **Establishes Relationships**
   - Foreign keys for data integrity
   - CASCADE deletes where appropriate
   - RESTRICT deletes for critical references

3. **Sets Up Security**
   - Parameterized queries throughout
   - Password hashing with bcrypt (12 rounds)
   - Email validation constraints
   - Role-based permissions

4. **Creates Indexes**
   - Email lookup optimization
   - Role-based filtering
   - Status-based queries
   - Audit trail searches

5. **Adds Sample Data**
   - 3 FOH new hires at various stages (7, 15, 30 days)
   - 3 BOH new hires at various stages (10, 20, 45 days)
   - Admin user account
   - Default password: `Welcome123!` (for sample hires)

### Usage

```bash
# Interactive (prompted for password)
npm run init:db

# Non-interactive (password as argument)
npm run init:db "YourSecurePassword123!"

# With DATABASE_URL environment variable
DATABASE_URL=postgresql://user:pass@host:5432/db npm run init:db
```

### Expected Output

```
==================================================
PRIDE Training App - Database Initialization
==================================================
✓ Database connection verified
✓ Database schema initialized successfully
✓ Created admin user (email: admin@pride.app)
✓ Seeded 6 sample new hire records

==================================================
DATABASE INITIALIZATION COMPLETE
==================================================

Admin User:
  Email:    admin@pride.app
  Password: [as provided]

Sample New Hires (3 FOH + 3 BOH):
  Default Password: Welcome123!

Next Steps:
  1. Log in with admin@pride.app
  2. Manage new hire assignments
  3. Begin onboarding and evaluations
==================================================
```

---

## CSV Import

### Overview

The CSV import script loads new hire data from comma-separated value files. It validates all fields, checks for duplicates, and creates user and new_hire records with proper relationships.

### Usage

```bash
npm run import:csv <path-to-csv-file>
```

#### Examples

```bash
# Import from project root
npm run import:csv ./data/new-hires.csv

# Import from absolute path
npm run import:csv /path/to/new-hires.csv

# From backend directory
npm run import:csv ../data/new-hires.csv
```

### CSV File Format

#### Header Row (required)

The first row must contain column headers. Column names are case-insensitive:

```csv
name,email,department,start_date,role,hire_date
```

#### Data Rows

Each subsequent row contains one new hire record:

```csv
Sarah Martinez,sarah.martinez@example.com,FOH,2024-01-15,foh_lead,2024-01-10
James Chen,james.chen@example.com,FOH,2024-02-01,new_hire,2024-01-28
Michel Dupont,michel.dupont@example.com,BOH,2024-01-20,chef,2024-01-15
```

### Column Specifications

| Column | Type | Required | Valid Values | Format | Example |
|--------|------|----------|--------------|--------|---------|
| `name` | String | Yes | Full name (first + last) | Text | John Doe |
| `email` | String | Yes | Valid email address | email@domain.com | john@example.com |
| `department` | String | Yes | FOH, BOH (case-insensitive) | Text | FOH or BOH |
| `start_date` | Date | Yes | Start date in hospitality | YYYY-MM-DD | 2024-01-15 |
| `role` | String | Yes | Valid role (see below) | Text | chef, foh_lead, etc. |
| `hire_date` | Date | Yes | Date hired/interview | YYYY-MM-DD | 2024-01-10 |

### Valid Roles

**FOH Roles:**
- `foh_lead` - Front-of-house lead/senior server
- `new_hire` - General server/new hire
- `manager` - FOH manager

**BOH Roles:**
- `chef` - Head chef
- `sous_chef` - Sous chef
- `asst_chef` - Assistant chef
- `new_hire` - General kitchen staff

**All Departments:**
- `admin` - System administrator
- `manager` - Department manager
- `asst_manager` - Assistant manager

### Sample CSV File

Create a file named `new-hires.csv`:

```csv
name,email,department,start_date,role,hire_date
Sarah Martinez,sarah.martinez@pride.app,FOH,2024-09-15,foh_lead,2024-09-10
James Chen,james.chen@pride.app,FOH,2024-09-22,new_hire,2024-09-20
Maria Santos,maria.santos@pride.app,FOH,2024-09-28,new_hire,2024-09-25
Michel Dupont,michel.dupont@pride.app,BOH,2024-09-10,chef,2024-09-05
Kenji Yamamoto,kenji.yamamoto@pride.app,BOH,2024-09-20,sous_chef,2024-09-18
Diego Rodriguez,diego.rodriguez@pride.app,BOH,2024-09-25,asst_chef,2024-09-22
```

### Import Process

1. **File validation** - Checks file exists and is readable
2. **CSV parsing** - Reads and parses CSV with quoted field support
3. **Header extraction** - Identifies columns from first row
4. **Record validation** - Validates each row against requirements
5. **Deduplication** - Checks for existing emails in database
6. **Database insert** - Creates user and new_hire records
7. **Transaction rollback** - Rolls back on any error

### Expected Output

```
Importing CSV file: ./data/new-hires.csv

Loaded 6 records from CSV

✓ Created: sarah.martinez@pride.app (line 2)
✓ Created: james.chen@pride.app (line 3)
✓ Created: maria.santos@pride.app (line 4)
✓ Created: michel.dupont@pride.app (line 5)
✓ Created: kenji.yamamoto@pride.app (line 6)
✓ Created: diego.rodriguez@pride.app (line 7)

==================================================
IMPORT SUMMARY
==================================================
Total Records:    6
Created:          6
Skipped:          0
Errors:           0
==================================================
```

### Deduplication

If you import the same CSV file twice, the second import will **skip** records that already exist:

```
✓ Created: new.user@pride.app (line 2)
⊘ Skipped (exists): existing.user@pride.app (line 3)
```

This allows you to safely re-run imports without creating duplicates.

---

## JSON Import

### Overview

The JSON import script loads new hire data from JSON files. Format and validation rules are identical to CSV import.

### Usage

```bash
npm run import:json <path-to-json-file>
```

#### Examples

```bash
npm run import:json ./data/new-hires.json
npm run import:json /path/to/new-hires.json
```

### JSON File Format

Must be a JSON array of objects:

```json
[
  {
    "name": "Sarah Martinez",
    "email": "sarah.martinez@example.com",
    "department": "FOH",
    "start_date": "2024-01-15",
    "role": "foh_lead",
    "hire_date": "2024-01-10"
  },
  {
    "name": "James Chen",
    "email": "james.chen@example.com",
    "department": "FOH",
    "start_date": "2024-02-01",
    "role": "new_hire",
    "hire_date": "2024-01-28"
  }
]
```

### Sample JSON File

Create a file named `new-hires.json`:

```json
[
  {
    "name": "Sarah Martinez",
    "email": "sarah.martinez@pride.app",
    "department": "FOH",
    "start_date": "2024-09-15",
    "role": "foh_lead",
    "hire_date": "2024-09-10"
  },
  {
    "name": "James Chen",
    "email": "james.chen@pride.app",
    "department": "FOH",
    "start_date": "2024-09-22",
    "role": "new_hire",
    "hire_date": "2024-09-20"
  },
  {
    "name": "Michel Dupont",
    "email": "michel.dupont@pride.app",
    "department": "BOH",
    "start_date": "2024-09-10",
    "role": "chef",
    "hire_date": "2024-09-05"
  }
]
```

### Validation Rules

Same as CSV import:
- All fields required
- Email must be valid format
- Department must be FOH or BOH
- Dates must be YYYY-MM-DD format and valid
- Role must be from valid role list

### Expected Output

```
Importing JSON file: ./data/new-hires.json

Loaded 3 records from JSON

✓ Created: sarah.martinez@pride.app (record 0)
✓ Created: james.chen@pride.app (record 1)
✓ Created: michel.dupont@pride.app (record 2)

==================================================
IMPORT SUMMARY
==================================================
Total Records:    3
Created:          3
Skipped:          0
Errors:           0
==================================================
```

---

## Data Format Specifications

### Date Format

All dates must be in ISO 8601 format: `YYYY-MM-DD`

**Valid examples:**
- `2024-01-15` ✓
- `2024-12-31` ✓
- `2024-09-28` ✓

**Invalid examples:**
- `01/15/2024` ✗ (US format)
- `15-01-2024` ✗ (EU format)
- `2024-1-15` ✗ (missing leading zero)
- `2024/01/15` ✗ (wrong separator)

### Email Format

Must be a valid email address following RFC 5322 basic rules:

**Valid examples:**
- `john@example.com` ✓
- `maria.santos@company.co.uk` ✓
- `first.last+tag@domain.org` ✓

**Invalid examples:**
- `john.example.com` ✗ (missing @)
- `@example.com` ✗ (missing local part)
- `john@` ✗ (missing domain)
- `john @example.com` ✗ (space in address)

### Department Values

Case-insensitive, but will be stored as:

| Input | Stored As | Meaning |
|-------|-----------|---------|
| FOH, foh, Foh | FOH | Front of House |
| BOH, boh, Boh | BOH | Back of House |

### Role Classification

**Front of House (FOH):**
- `foh_lead` - Senior server or FOH lead
- `new_hire` - Entry-level server
- `manager` - FOH manager

**Back of House (BOH):**
- `chef` - Head/Executive chef
- `sous_chef` - Sous chef (2nd in command)
- `asst_chef` - Assistant/Prep chef
- `new_hire` - Kitchen staff member

**Both:**
- `admin` - System administrator
- `manager` - General manager
- `asst_manager` - Assistant manager

---

## Troubleshooting

### Issue: Database Connection Error

**Error:** "Failed to connect to database: ECONNREFUSED"

**Causes:**
- PostgreSQL server not running
- Wrong connection string
- Firewall blocking connection

**Solutions:**

```bash
# Check PostgreSQL is running
# Linux/Mac:
sudo systemctl status postgresql
brew services list | grep postgres

# Windows:
Get-Service PostgreSQL*

# Verify DATABASE_URL
echo $DATABASE_URL

# Test connection manually
psql postgresql://user:pass@localhost:5432/pride_training_db
```

### Issue: Schema Already Exists

**Error:** "relation \"users\" already exists"

**Causes:**
- Database already initialized
- Running init-db twice

**Solutions:**

```bash
# Option 1: Drop and recreate (WARNING: DELETES ALL DATA)
dropdb pride_training_db
createdb pride_training_db
npm run init:db

# Option 2: Skip init and just import data
npm run import:csv data/new-hires.csv
```

### Issue: Invalid Email Format

**Error:** "Error (line 2): validation - Invalid email format"

**Causes:**
- Email missing @
- Email missing domain
- Special characters not allowed in email

**Solutions:**

Fix the email in your CSV/JSON file. Valid examples:
- `john.doe@company.com` ✓
- `maria_santos@pride.app` ✓
- `first+tag@domain.org` ✓

### Issue: Invalid Department

**Error:** "Error (line 3): validation - Invalid department (must be FOH or BOH)"

**Causes:**
- Typo in department name (FOOD, HOS, etc.)
- Extra spaces (FOH , " BOH")
- Wrong case (foh_lead is a role, not department)

**Solutions:**

Use exactly FOH or BOH (case-insensitive):
```csv
Sarah,sarah@example.com,FOH,2024-01-15,new_hire,2024-01-10  ✓
Michel,michel@example.com,BOH,2024-01-15,chef,2024-01-10     ✓
John,john@example.com,foh_lead,2024-01-15,new_hire,2024-01-10 ✗ (foh_lead is role)
```

### Issue: Invalid Role

**Error:** "Error (line 4): validation - Invalid role (must be one of: chef, foh_lead, ...)"

**Causes:**
- Typo in role name
- Missing underscore (foh_lead not fohlead)
- Using department as role

**Solutions:**

Use roles from the valid list (case-insensitive):

**FOH:**
- `foh_lead` - not foh-lead or fohlead
- `new_hire`
- `manager`

**BOH:**
- `chef`
- `sous_chef` - not souschef
- `asst_chef` - not assistant_chef
- `new_hire`
- `manager`

### Issue: Invalid Date Format

**Error:** "Error (line 5): validation - Invalid start_date format (must be YYYY-MM-DD)"

**Causes:**
- Wrong date format (MM/DD/YYYY, DD-MM-YYYY, etc.)
- Invalid date (2024-13-01, 2024-02-30)
- Non-existent date

**Solutions:**

Use ISO 8601 format (YYYY-MM-DD) with valid dates:

```csv
2024-01-15  ✓ (January 15, 2024)
01/15/2024  ✗ (US format)
15-01-2024  ✗ (EU format)
2024-02-30  ✗ (February doesn't have 30 days)
```

### Issue: Email Already Exists

**Error:** "⊘ Skipped (exists): john@example.com (line 2)"

**Causes:**
- Email was already imported
- User created manually in database

**Solutions:**

This is not an error - it's intentional deduplication:

```
✓ Created: new.user@example.com (line 2)
⊘ Skipped (exists): john@example.com (line 3)
```

Options:
1. **Continue with import** - Other records will be imported
2. **Update existing user** - Use database directly or admin panel
3. **Use different email** - For duplicate people with different roles
4. **Delete existing record** - Via database or admin panel (logs deletion)

### Issue: Missing Required Field

**Error:** "Error (line 6): validation - Missing or empty name"

**Causes:**
- Column not included in CSV header
- Value is blank/empty in row
- Column name misspelled in header

**Solutions:**

Ensure all 6 required columns are in header:
```csv
name,email,department,start_date,role,hire_date
```

Ensure no blank values:
```csv
John Doe,john@example.com,FOH,2024-01-15,new_hire,2024-01-10  ✓
John Doe,,FOH,2024-01-15,new_hire,2024-01-10                   ✗ (blank email)
```

### Issue: Transaction Rollback

**Error:** "Fatal error: relation does not exist"

**Causes:**
- Database schema not initialized
- Table deleted or dropped
- Permissions missing

**Solutions:**

```bash
# Reinitialize database
npm run init:db

# Check permissions (if using non-standard user)
psql -U postgres -c "GRANT ALL ON DATABASE pride_training_db TO pride_user"
```

### Issue: Out of Memory

**Error:** "JavaScript heap out of memory"

**Causes:**
- CSV/JSON file is very large (>1GB)
- Processing batch size too small

**Solutions:**

```bash
# For large files, increase Node heap
NODE_OPTIONS="--max-old-space-size=4096" npm run import:csv large-file.csv

# Or increase batch size in script
BATCH_SIZE=500 npm run import:csv data/new-hires.csv
```

---

## Advanced Usage

### Environment Variables

Control behavior with environment variables:

```bash
# Custom database connection
DATABASE_URL=postgresql://user:pass@host:5432/db npm run init:db

# Batch size for imports (default: 100)
BATCH_SIZE=50 npm run import:csv data/new-hires.csv
BATCH_SIZE=500 npm run import:json data/new-hires.json

# Password for admin user (non-interactive)
npm run init:db "MySecurePassword123!"

# Increase memory for large imports
NODE_OPTIONS="--max-old-space-size=2048" npm run import:csv large-file.csv
```

### Batch Processing

Scripts automatically process records in batches (default: 100 per batch):

```javascript
// Each batch is its own transaction
// If batch fails, entire batch rolls back
// Successful previous batches remain committed
```

This means:
- ✓ **Safe partial imports** - If error on row 150, first 100 are saved
- ✓ **Performance** - Optimized batch size for typical workloads
- ✓ **Reliability** - Each batch is atomic transaction

### Transaction Handling

All imports use database transactions:

```
CSV File (300 records)
  → Batch 1 (100) → Transaction BEGIN/COMMIT
  → Batch 2 (100) → Transaction BEGIN/COMMIT
  → Batch 3 (100) → Transaction BEGIN/COMMIT
```

**If error occurs in Batch 2:**
- Batch 1: Committed ✓
- Batch 2: Rolled back ✗
- Batch 3: Not processed

### Custom Script Modifications

To modify scripts (e.g., change password hashing, validation rules):

1. **Edit script file:**
   ```bash
   # Edit validation rules
   vim backend/scripts/import-csv.js
   ```

2. **Find the validation function:**
   ```javascript
   function validateRecord(record, lineNumber) {
     const errors = [];
     // Add custom validation here
     return { valid: errors.length === 0, errors };
   }
   ```

3. **Save and re-run:**
   ```bash
   npm run import:csv data/new-hires.csv
   ```

### Logging and Debugging

Scripts output detailed progress:

```
✓ Created: john@example.com (line 2)     # Success
⊘ Skipped (exists): jane@example.com (line 3)  # Duplicate
✗ Error (line 4): validation - ...       # Error

ERROR DETAILS:
  Line 4 (john@example.com): validation - Invalid email format
```

For debugging, add console.logs to script:

```javascript
// In scripts/import-csv.js
const result = await importRecord(client, record);
console.log('DEBUG:', { record, result }); // Add this
```

---

## Support and Questions

For issues or questions:

1. **Check Troubleshooting section** above
2. **Review log output** for specific error messages
3. **Verify data format** against specifications
4. **Check database connection** with `psql`
5. **Review schema.sql** for table structure

---

## Related Documentation

- [Backend README](./README.md) - Backend setup and running
- [Database Schema](./src/db/schema.sql) - Complete schema definition
- [API Documentation](../docs/API.md) - REST API endpoints
- [Security Audit](../SECURITY_AUDIT_REPORT.md) - Security considerations

---

**Last Updated:** September 28, 2024  
**Version:** 1.0.0
