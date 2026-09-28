import { chromium, FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Global setup for E2E tests
 * Runs once before all tests
 */
async function globalSetup(config: FullConfig) {
  // Load environment variables from .env.test
  const envPath = path.join(__dirname, '../.env.test');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach((line) => {
      const [key, value] = line.split('=');
      if (key && value && !key.startsWith('#')) {
        process.env[key] = value.trim();
      }
    });
  }

  // Ensure test-results directory exists
  const resultsDir = path.join(__dirname, '../test-results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  console.log('Global setup completed');
  console.log(`Running E2E tests against: ${process.env.BASE_URL}`);
  console.log(`API endpoint: ${process.env.API_BASE_URL}`);
}

export default globalSetup;
