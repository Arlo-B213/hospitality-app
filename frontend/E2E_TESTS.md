# End-to-End (E2E) Tests

Comprehensive E2E test suite using Playwright for the PRIDE Training App.

## Overview

This test suite covers critical user flows:
- **Auth Flow**: Registration, login, logout, protected route access, JWT token management
- **New Hire Evaluation**: Create evaluations, rate technical/soft/leadership skills, save data
- **Offline Sync**: Queue changes offline, sync when online, conflict resolution
- **Analytics**: View charts, verify metrics, export data
- **Settings**: Change password, update preferences, manage profile

## Setup

### Prerequisites
- Node.js >= 18
- Frontend dev server running (`npm run dev`)
- Backend API running on http://localhost:5000

### Installation

```bash
# Install Playwright and browsers
npm install --save-dev @playwright/test

# Install browsers (one-time)
npx playwright install
```

### Environment Setup

Create/update `.env.test` with test credentials:

```env
BASE_URL=http://localhost:3000
API_BASE_URL=http://localhost:5000

TEST_USER_EMAIL=test.user@pride-training.test
TEST_USER_PASSWORD=TestPassword123!
TEST_USER_FIRST_NAME=Test
TEST_USER_LAST_NAME=User

TEST_ADMIN_EMAIL=admin@pride-training.test
TEST_ADMIN_PASSWORD=AdminPassword123!

TEST_NEW_HIRE_EMAIL=newhire@pride-training.test
TEST_NEW_HIRE_FIRST_NAME=John
TEST_NEW_HIRE_LAST_NAME=Doe
```

## Running Tests

### All Tests (Headless)
```bash
npm run test:e2e
```

### Specific Test File
```bash
npx playwright test e2e/auth.spec.ts
```

### Specific Test Suite
```bash
npx playwright test -g "Authentication Flow"
```

### Interactive/Debug Mode
```bash
npm run test:e2e:debug
```

### Headed Mode (See Browser)
```bash
npm run test:e2e:headed
```

### Single Browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
```

### Update Snapshots
```bash
npx playwright test --update-snapshots
```

## Test Files

### e2e/auth.spec.ts
Tests authentication and authorization:
- User registration
- User login with valid credentials
- Login rejection with invalid credentials
- Protected route access
- Redirect to login when not authenticated
- Logout functionality
- JWT token persistence across reloads

**Expected Outcomes:**
- Users can register and create accounts
- Valid login redirects to dashboard
- Invalid credentials show error message
- Token is stored in localStorage and persists
- Protected routes require authentication

### e2e/evaluation.spec.ts
Tests new hire evaluation workflows:
- Create new hire evaluations
- Rate technical skills
- Rate soft skills
- Rate leadership potential
- Save evaluation and verify persistence
- Form validation
- Cancel without saving

**Expected Outcomes:**
- Evaluations can be created and saved
- All skill categories can be rated
- Data persists after save
- Required field validation works
- Cancel operation reverts changes

### e2e/offline.spec.ts
Tests offline functionality and sync:
- Queue changes when offline
- Sync changes when coming back online
- Retain changes through disconnection
- Show offline indicator
- Handle concurrent offline changes
- Handle sync errors gracefully

**Expected Outcomes:**
- App works offline with fallback
- Changes are queued locally
- Sync completes when online
- Offline indicator shows/hides correctly
- User data integrity maintained

### e2e/analytics.spec.ts
Tests analytics and reporting features:
- Navigate to analytics page
- Charts render correctly
- Metrics display correctly
- Distribution charts visible
- Skill assessment metrics shown
- Timeline/progress charts
- Date filtering
- Export functionality
- Real-time updates

**Expected Outcomes:**
- Analytics page loads with charts
- Data visualizations render
- All metrics are correct
- Filtering works properly
- Export generates correct format

### e2e/settings.spec.ts
Tests user settings and preferences:
- Navigate to settings
- Change password
- Password validation (wrong current, weak passwords)
- Save preferences
- Display profile information
- Edit profile information
- Form validation
- Logout from settings
- Show user role/permissions
- API error handling

**Expected Outcomes:**
- Settings page loads
- Password changes work with validation
- Preferences update correctly
- Profile information displays
- Password validation enforces rules
- Errors are handled gracefully

## Test Utilities

### Fixtures (e2e/fixtures.ts)

Provides:
- `authenticatedPage`: Pre-logged-in page for testing authenticated routes
- `adminPage`: Pre-logged-in admin page

Usage:
```typescript
import { test } from './e2e/fixtures';

test('should work as authenticated user', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/dashboard');
  // Test code here
});
```

### Helper Functions

```typescript
import { fillForm, clickButton, getErrorMessage } from './e2e/fixtures';

// Fill multiple form fields
await fillForm(page, {
  'input[name="email"]': 'test@example.com',
  'input[name="password"]': 'password123',
});

// Click button by text
await clickButton(page, 'Submit');

// Get error message
const error = await getErrorMessage(page);
console.log(error);
```

### Test Data Generators

```typescript
import { generateTestUser, generateNewHire, generateEvaluation } from './e2e/fixtures';

const user = generateTestUser();
const hire = generateNewHire();
const eval = generateEvaluation();
```

## Configuration

### playwright.config.ts

Key settings:
- **Timeout**: 30 seconds per test
- **Expect timeout**: 5 seconds for assertions
- **Retries**: 2 in CI, 0 locally
- **Browsers**: Chromium, Firefox
- **Screenshots**: On failure only
- **Videos**: On failure only
- **Trace**: On first retry

Modify browser configuration:
```typescript
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit', use: { ...devices['Desktop Safari'] } }, // Add if needed
],
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Start backend
        run: npm run dev --prefix ../backend &
      
      - name: Start frontend
        run: npm run dev &
      
      - name: Wait for services
        run: sleep 10
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: test-results/
```

## Debugging

### View Test Reports

```bash
# Generate HTML report
npx playwright show-report

# View as server
npx playwright show-report --host 0.0.0.0 --port 3000
```

### Debug Mode
```bash
npm run test:e2e:debug
```
This opens Playwright Inspector where you can:
- Step through tests
- Pause execution
- Inspect elements
- Execute code in console

### Screenshots & Videos
After test failure, screenshots and videos are saved to:
- `test-results/` - Screenshots on failure
- `playwright-report/` - Full HTML report with videos

### Network Inspection
```bash
# Run with network interception
npx playwright test --trace on
```

Then inspect network requests in report.

### Verbose Logging
```bash
DEBUG=pw:api npm run test:e2e
```

## Best Practices

### 1. Test Isolation
- Each test is independent
- Use `test.beforeEach()` to set up state
- Clear storage/cookies between tests
- Don't depend on test execution order

### 2. Proper Waits
✅ Good:
```typescript
await page.locator('text=Success').waitFor({ state: 'visible', timeout: 5000 });
await page.waitForURL(/\/dashboard/, { timeout: 10000 });
```

❌ Bad:
```typescript
await page.waitForTimeout(2000);
```

### 3. Selectors
✅ Good:
```typescript
page.locator('text=Log In')
page.locator('input[type="email"]')
page.locator('button:has-text("Submit")')
```

❌ Bad:
```typescript
page.locator('div.container > span:nth-child(5)')
```

### 4. Parameterize Test Data
✅ Good:
```typescript
const email = process.env.TEST_USER_EMAIL || 'test@example.com';
```

❌ Bad:
```typescript
const email = 'hardcoded@example.com';
```

### 5. Error Handling
Always handle potential timeouts:
```typescript
const element = page.locator('rare-element').first();
if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
  // Element exists
}
```

## Troubleshooting

### Tests Timing Out
- Increase timeout in `playwright.config.ts`
- Check if backend API is running
- Verify BASE_URL is correct

### Login Tests Failing
- Verify test user exists in database
- Check credentials in `.env.test`
- Ensure backend auth is working

### Flaky Tests
- Check for hardcoded waits (use proper wait conditions)
- Verify selectors work consistently
- Look for network race conditions
- Run tests in isolation: `npx playwright test test.spec.ts`

### Screenshots/Videos Not Generated
- Check `test-results/` directory permissions
- Verify `screenshot: 'only-on-failure'` in config
- Ensure tests are actually failing

### Can't Connect to App
```bash
# Test connection
curl http://localhost:3000
curl http://localhost:5000/health

# Check if ports are in use
lsof -i :3000
lsof -i :5000
```

## Performance Notes

- Full test suite runs in ~5-10 minutes
- Parallel execution reduces time significantly
- Chromium is fastest, Firefox slightly slower
- Videos/traces add overhead, remove in production CI if needed

## Contributing

When adding new tests:
1. Follow naming convention: `{feature}.spec.ts`
2. Use fixtures for authentication
3. Include error cases
4. Use proper wait conditions
5. Document expected outcomes
6. Run locally: `npm run test:e2e:headed`

## References

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Configuration](https://playwright.dev/docs/test-configuration)
