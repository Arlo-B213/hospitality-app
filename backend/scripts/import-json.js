#!/usr/bin/env node

/**
 * JSON Data Import Script for PRIDE Training App
 * Imports new hire data from JSON files into PostgreSQL
 *
 * JSON Format:
 * [
 *   {
 *     "name": "John Doe",
 *     "email": "john@example.com",
 *     "department": "FOH",
 *     "start_date": "2024-01-15",
 *     "role": "foh_lead",
 *     "hire_date": "2024-01-10"
 *   }
 * ]
 *
 * Usage: node scripts/import-json.js <json-file>
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Configuration
const BATCH_SIZE = 100;
const VALID_DEPARTMENTS = ['FOH', 'BOH'];
const VALID_ROLES = ['chef', 'foh_lead', 'asst_chef', 'sous_chef', 'new_hire', 'manager', 'asst_manager'];
const PASSWORD_HASH_ROUNDS = 12;

// Database pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://pride_user:pride_password@localhost:5432/pride_training_db',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Import results tracking
const results = {
  total: 0,
  created: 0,
  skipped: 0,
  errors: 0,
  errorDetails: [],
};

/**
 * Validates a date string (YYYY-MM-DD format)
 */
function isValidDate(dateStr) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;

  const date = new Date(dateStr + 'T00:00:00Z');
  return date instanceof Date && !isNaN(date) && dateStr === date.toISOString().split('T')[0];
}

/**
 * Validates a single record
 */
function validateRecord(record, index) {
  const errors = [];

  // Check required fields
  if (!record.name || typeof record.name !== 'string' || !record.name.trim()) {
    errors.push('Missing or invalid name (must be non-empty string)');
  }

  if (!record.email || typeof record.email !== 'string' || !record.email.trim()) {
    errors.push('Missing or invalid email (must be non-empty string)');
  } else {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/;
    if (!emailRegex.test(record.email.trim())) {
      errors.push('Invalid email format');
    }
  }

  if (!record.department || typeof record.department !== 'string' || !record.department.trim()) {
    errors.push('Missing or invalid department (must be non-empty string)');
  } else if (!VALID_DEPARTMENTS.includes(record.department.trim().toUpperCase())) {
    errors.push(`Invalid department (must be FOH or BOH): ${record.department}`);
  }

  if (!record.start_date || typeof record.start_date !== 'string' || !record.start_date.trim()) {
    errors.push('Missing or invalid start_date (must be non-empty string)');
  } else if (!isValidDate(record.start_date.trim())) {
    errors.push(`Invalid start_date format (must be YYYY-MM-DD): ${record.start_date}`);
  }

  if (!record.role || typeof record.role !== 'string' || !record.role.trim()) {
    errors.push('Missing or invalid role (must be non-empty string)');
  } else if (!VALID_ROLES.includes(record.role.trim().toLowerCase())) {
    errors.push(`Invalid role (must be one of: ${VALID_ROLES.join(', ')}): ${record.role}`);
  }

  if (!record.hire_date || typeof record.hire_date !== 'string' || !record.hire_date.trim()) {
    errors.push('Missing or invalid hire_date (must be non-empty string)');
  } else if (!isValidDate(record.hire_date.trim())) {
    errors.push(`Invalid hire_date format (must be YYYY-MM-DD): ${record.hire_date}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Checks if email already exists in database
 */
async function emailExists(client, email) {
  const result = await client.query(
    'SELECT id FROM users WHERE email = $1',
    [email.toLowerCase()]
  );
  return result.rows.length > 0;
}

/**
 * Generates default password hash
 */
async function generateDefaultPassword() {
  // Default password is hashed version of "Welcome123!"
  return await bcrypt.hash('Welcome123!', PASSWORD_HASH_ROUNDS);
}

/**
 * Imports a single record into the database
 */
async function importRecord(client, record, index) {
  try {
    // Validate record
    const validation = validateRecord(record, index);
    if (!validation.valid) {
      return {
        success: false,
        type: 'validation',
        error: validation.errors.join('; '),
        recordIndex: index,
      };
    }

    const email = record.email.trim().toLowerCase();
    const department = record.department.trim().toUpperCase();
    const role = record.role.trim().toLowerCase();
    const startDate = record.start_date.trim();
    const hireDate = record.hire_date.trim();

    // Parse name into first and last
    const nameParts = record.name.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || 'Unknown';

    // Check for existing email
    if (await emailExists(client, email)) {
      return {
        success: false,
        type: 'duplicate',
        email,
        recordIndex: index,
      };
    }

    // Generate password hash
    const passwordHash = await generateDefaultPassword();

    // Calculate 90-day target date
    const day90Date = new Date(startDate + 'T00:00:00Z');
    day90Date.setDate(day90Date.getDate() + 90);
    const day90TargetDate = day90Date.toISOString().split('T')[0];

    // Create user and new_hire record in transaction
    const userResult = await client.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, team, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING id`,
      [email, passwordHash, firstName, lastName, role, department]
    );

    const userId = userResult.rows[0].id;

    // Get a manager user (first admin/manager found)
    const managerResult = await client.query(
      `SELECT id FROM users WHERE role IN ('admin', 'manager', 'asst_manager') LIMIT 1`
    );

    let hireManagedId = null;
    if (managerResult.rows.length > 0) {
      hireManagedId = managerResult.rows[0].id;
    } else {
      // If no manager exists, use the user's own ID (they'll need to be assigned properly later)
      hireManagedId = userId;
    }

    // Create new_hire record
    await client.query(
      `INSERT INTO new_hires (user_id, department, start_date, day_90_target_date, hire_manager_id, is_active)
       VALUES ($1, $2, $3, $4, $5, true)`,
      [userId, department, startDate, day90TargetDate, hireManagedId]
    );

    return {
      success: true,
      email,
      userId,
      recordIndex: index,
    };
  } catch (error) {
    return {
      success: false,
      type: 'database',
      error: error.message,
      recordIndex: index,
    };
  }
}

/**
 * Processes records in batches with transaction handling
 */
async function processBatch(records) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const result = await importRecord(client, record, i);

      results.total++;
      if (result.success) {
        results.created++;
        console.log(`✓ Created: ${result.email} (record ${result.recordIndex})`);
      } else if (result.type === 'duplicate') {
        results.skipped++;
        console.log(`⊘ Skipped (exists): ${result.email} (record ${result.recordIndex})`);
      } else {
        results.errors++;
        results.errorDetails.push({
          recordIndex: result.recordIndex,
          email: record.email,
          type: result.type,
          error: result.error,
        });
        console.error(`✗ Error (record ${result.recordIndex}): ${result.error}`);
      }
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Loads and validates JSON file
 */
async function loadJSON(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(content);

  if (!Array.isArray(data)) {
    throw new Error('JSON must contain an array of records');
  }

  return data;
}

/**
 * Main import function
 */
async function main() {
  const filePath = process.argv[2];

  if (!filePath) {
    console.error('Usage: node import-json.js <json-file>');
    process.exit(1);
  }

  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  try {
    console.log(`Importing JSON file: ${filePath}\n`);

    // Load and validate JSON
    const records = await loadJSON(filePath);
    console.log(`Loaded ${records.length} records from JSON\n`);

    if (records.length === 0) {
      console.log('No records to import.');
      process.exit(0);
    }

    // Process records in batches
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE);
      await processBatch(batch);
    }

    // Print summary
    console.log('\n' + '='.repeat(50));
    console.log('IMPORT SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Records:    ${results.total}`);
    console.log(`Created:          ${results.created}`);
    console.log(`Skipped:          ${results.skipped}`);
    console.log(`Errors:           ${results.errors}`);

    if (results.errorDetails.length > 0) {
      console.log('\nERROR DETAILS:');
      results.errorDetails.forEach((detail) => {
        console.log(
          `  Record ${detail.recordIndex} (${detail.email}): ${detail.type} - ${detail.error}`
        );
      });
    }

    console.log('='.repeat(50));

    process.exit(results.errors > 0 ? 1 : 0);
  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
