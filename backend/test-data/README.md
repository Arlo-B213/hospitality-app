# Test Data Files

Sample data files for testing PRIDE Training App migration scripts.

## Files

### `sample-new-hires.csv`
Clean CSV data with 6 valid new hire records (3 FOH + 3 BOH).
Use to test successful CSV import.

**Usage:**
```bash
npm run import:csv test-data/sample-new-hires.csv
```

### `sample-new-hires.json`
Clean JSON data with 6 valid new hire records (3 FOH + 3 BOH).
Use to test successful JSON import.

**Usage:**
```bash
npm run import:json test-data/sample-new-hires.json
```

### `sample-with-errors.csv`
CSV data with intentional validation errors:
- Invalid email format
- Missing email (blank)
- Invalid department
- Invalid date format
- Invalid role
- Missing name

Use to test error handling and validation.

**Usage:**
```bash
npm run import:csv test-data/sample-with-errors.csv
```

**Expected Output:**
- 2 records created (Valid User, Another Valid)
- 5 records with validation errors
- Transaction handles partial success properly

## Testing Workflow

### 1. Fresh Database Setup
```bash
# Initialize database with admin user and sample data
npm run init:db "TestPassword123!"
```

### 2. Test CSV Import
```bash
# Import clean CSV data
npm run import:csv test-data/sample-new-hires.csv

# Expected: 6 created, 0 skipped, 0 errors
```

### 3. Test Deduplication
```bash
# Re-run same CSV import
npm run import:csv test-data/sample-new-hires.csv

# Expected: 0 created, 6 skipped (already exist), 0 errors
```

### 4. Test JSON Import
```bash
# Import different JSON data
npm run import:json test-data/sample-new-hires.json

# Expected: 6 created, 0 skipped, 0 errors
```

### 5. Test Error Handling
```bash
# Import data with validation errors
npm run import:csv test-data/sample-with-errors.csv

# Expected: 2 created, 0 skipped, 5 errors
# Check error details for specific validation failures
```

## Adding More Test Data

To create additional test data files:

1. **For valid data:** Use format from `sample-new-hires.csv`
2. **For specific errors:** Use format from `sample-with-errors.csv`

Required columns (all required, case-insensitive):
- `name` - Full name (string)
- `email` - Email address (valid format)
- `department` - FOH or BOH
- `start_date` - YYYY-MM-DD format
- `role` - Valid role from specification
- `hire_date` - YYYY-MM-DD format

Valid roles:
- FOH: `foh_lead`, `new_hire`, `manager`
- BOH: `chef`, `sous_chef`, `asst_chef`, `new_hire`, `manager`
- Admin: `admin`, `manager`, `asst_manager`

## Notes

- Test data includes realistic names from multiple backgrounds
- Dates are offset from current date for realistic data
- Sample new hire records create user accounts with default password: `Welcome123!`
- All test imports are transactional (rollback on error)
- Deduplication prevents duplicate imports of same email addresses
