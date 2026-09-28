#!/usr/bin/env node

/**
 * Database Initialization Script for PRIDE Training App
 * Creates all tables, seeds sample data, and sets up indexes
 *
 * Usage: node scripts/init-db.js [admin-password]
 * If admin-password is not provided, you will be prompted
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const readline = require('readline');

// Configuration
const PASSWORD_HASH_ROUNDS = 12;
const SCHEMA_FILE = path.join(__dirname, '../src/db/schema.sql');

// Database pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://pride_user:pride_password@localhost:5432/pride_training_db',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

/**
 * Prompts user for input
 */
function prompt(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

/**
 * Prompts user for password (hidden input)
 */
function promptPassword(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    process.stdout.write(question);
    process.stdin.resume();
    process.stdin.setRawMode(true);

    let password = '';

    process.stdin.on('data', (char) => {
      char = char.toString();
      if (char === '\u0003') {
        process.exit();
      }
      if (char === '\r' || char === '\n') {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        console.log('');
        resolve(password);
      } else if (char === '\u0008') {
        password = password.slice(0, -1);
      } else {
        password += char;
      }
    });
  });
}

/**
 * Reads and executes schema.sql
 */
async function initializeSchema() {
  if (!fs.existsSync(SCHEMA_FILE)) {
    throw new Error(`Schema file not found: ${SCHEMA_FILE}`);
  }

  const schema = fs.readFileSync(SCHEMA_FILE, 'utf-8');

  // Split by ; and filter empty statements
  const statements = schema
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0);

  console.log(`\nExecuting ${statements.length} SQL statements...`);

  const client = await pool.connect();
  try {
    for (let i = 0; i < statements.length; i++) {
      try {
        await client.query(statements[i]);
      } catch (error) {
        // Ignore "already exists" errors which are safe during reinitialization
        if (!error.message.includes('already exists')) {
          throw error;
        }
      }
    }
    console.log('✓ Database schema initialized successfully');
  } finally {
    client.release();
  }
}

/**
 * Seeds sample new hire data
 */
async function seedSampleData(adminUserId) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Sample FOH new hires
    const fohHires = [
      {
        name: 'Sarah Martinez',
        email: 'sarah.martinez@pride.app',
        department: 'FOH',
        role: 'foh_lead',
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
      },
      {
        name: 'James Chen',
        email: 'james.chen@pride.app',
        department: 'FOH',
        role: 'new_hire',
        startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 days ago
      },
      {
        name: 'Maria Santos',
        email: 'maria.santos@pride.app',
        department: 'FOH',
        role: 'new_hire',
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
      },
    ];

    // Sample BOH new hires
    const bohHires = [
      {
        name: 'Michel Dupont',
        email: 'michel.dupont@pride.app',
        department: 'BOH',
        role: 'chef',
        startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 45 days ago
      },
      {
        name: 'Kenji Yamamoto',
        email: 'kenji.yamamoto@pride.app',
        department: 'BOH',
        role: 'sous_chef',
        startDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 20 days ago
      },
      {
        name: 'Diego Rodriguez',
        email: 'diego.rodriguez@pride.app',
        department: 'BOH',
        role: 'asst_chef',
        startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 days ago
      },
    ];

    const allHires = [...fohHires, ...bohHires];
    let createdCount = 0;

    for (const hire of allHires) {
      const passwordHash = await bcrypt.hash('Welcome123!', PASSWORD_HASH_ROUNDS);
      const nameParts = hire.name.trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');

      const userResult = await client.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role, team, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, true)
         RETURNING id`,
        [hire.email, passwordHash, firstName, lastName, hire.role, hire.department]
      );

      const userId = userResult.rows[0].id;

      // Calculate 90-day target date
      const startDate = new Date(hire.startDate + 'T00:00:00Z');
      const day90Date = new Date(startDate);
      day90Date.setDate(day90Date.getDate() + 90);
      const day90TargetDate = day90Date.toISOString().split('T')[0];

      // Create new_hire record
      await client.query(
        `INSERT INTO new_hires (user_id, department, start_date, day_90_target_date, hire_manager_id, is_active)
         VALUES ($1, $2, $3, $4, $5, true)`,
        [userId, hire.department, hire.startDate, day90TargetDate, adminUserId]
      );

      createdCount++;
    }

    await client.query('COMMIT');
    console.log(`✓ Seeded ${createdCount} sample new hire records`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Creates admin user
 */
async function createAdminUser(adminPassword) {
  const client = await pool.connect();

  try {
    const email = 'admin@pride.app';
    const passwordHash = await bcrypt.hash(adminPassword, PASSWORD_HASH_ROUNDS);

    // Check if admin already exists
    const existingAdmin = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingAdmin.rows.length > 0) {
      console.log('✓ Admin user already exists (admin@pride.app)');
      return existingAdmin.rows[0].id;
    }

    const result = await client.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING id`,
      [email, passwordHash, 'Admin', 'User', 'admin']
    );

    const adminId = result.rows[0].id;
    console.log('✓ Created admin user (email: admin@pride.app)');
    return adminId;
  } finally {
    client.release();
  }
}

/**
 * Verifies database connection
 */
async function verifyConnection() {
  try {
    await pool.query('SELECT NOW()');
    console.log('✓ Database connection verified');
  } catch (error) {
    throw new Error(`Failed to connect to database: ${error.message}`);
  }
}

/**
 * Main initialization function
 */
async function main() {
  try {
    console.log('='.repeat(50));
    console.log('PRIDE Training App - Database Initialization');
    console.log('='.repeat(50));

    // Verify connection
    await verifyConnection();

    // Initialize schema
    await initializeSchema();

    // Get or prompt for admin password
    let adminPassword = process.argv[2];
    if (!adminPassword) {
      console.log('\nPlease provide an admin password.');
      console.log('Requirements: At least 8 characters, 1 uppercase, 1 number, 1 special character');
      adminPassword = await promptPassword('\nEnter admin password: ');

      if (!adminPassword) {
        throw new Error('Admin password is required');
      }
    }

    // Create admin user
    const adminId = await createAdminUser(adminPassword);

    // Seed sample data
    await seedSampleData(adminId);

    // Print summary
    console.log('\n' + '='.repeat(50));
    console.log('DATABASE INITIALIZATION COMPLETE');
    console.log('='.repeat(50));
    console.log('\nAdmin User:');
    console.log('  Email:    admin@pride.app');
    console.log('  Password: [as provided]');
    console.log('\nSample New Hires (3 FOH + 3 BOH):');
    console.log('  Default Password: Welcome123!');
    console.log('\nNext Steps:');
    console.log('  1. Log in with admin@pride.app');
    console.log('  2. Manage new hire assignments');
    console.log('  3. Begin onboarding and evaluations');
    console.log('='.repeat(50));

    process.exit(0);
  } catch (error) {
    console.error('\n✗ Initialization failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
