# 🚀 Cypress Testing - Quick Start Guide

## Prerequisites Checklist

Before running tests, make sure:

- [ ] MongoDB is running
- [ ] Backend server is running on `http://localhost:5000`
- [ ] Frontend dev server is running on `http://localhost:5173`
- [ ] Test data is seeded in database

---

## Step 1: Seed Test Data

```bash
cd backend
npm run seed
```

Expected output:
```
✅ Admin created: admin@example.com
✅ Officer created: officer@example.com
✅ Citizen created: citizen@example.com
✅ 3 resources created
```

---

## Step 2: Start Servers

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

---

## Step 3: Install Cypress

```bash
cd frontend
npm install
```

---

## Step 4: Run Tests

### Option A: Interactive Mode (Recommended for Development)

```bash
cd frontend
npm run cypress:open
```

Then:
1. Click "E2E Testing"
2. Choose your browser (Chrome recommended)
3. Click on a test file to run it

### Option B: Headless Mode (Recommended for CI/CD)

```bash
cd frontend
npm run cypress:run
```

### Option C: Run Specific Test Suite

```bash
cd frontend
npx cypress run --spec "cypress/e2e/01-authentication.cy.js"
```

---

## Test Credentials

Use these credentials when manually testing:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@example.com | password123 |
| **Officer** | officer@example.com | password123 |
| **Citizen** | citizen@example.com | password123 |

---

## Test Suites Overview

| File | Description | Test Count |
|------|-------------|------------|
| `01-authentication.cy.js` | Login, Register, Logout | 12 tests |
| `02-dashboard.cy.js` | Dashboard stats and charts | 8 tests |
| `03-complaints.cy.js` | Complaint management | 25 tests |
| `04-resources.cy.js` | Resource management | 18 tests |
| `05-users.cy.js` | User management (Admin) | 20 tests |
| `06-profile.cy.js` | Profile editing | 18 tests |
| **TOTAL** | | **101 tests** |

---

## Quick Commands Reference

```bash
# Install dependencies
npm install

# Open Cypress Test Runner
npm run cypress:open

# Run all tests in headless mode
npm run cypress:run

# Run tests with browser visible
npm run test:e2e:headed

# Run specific test file
npx cypress run --spec "cypress/e2e/01-authentication.cy.js"

# Run with specific browser
npx cypress run --browser chrome
npx cypress run --browser firefox

# Run with debug output
DEBUG=cypress:* npm run cypress:run
```

---

## Common Issues & Quick Fixes

### ❌ Tests fail with timeout errors

**Fix:**
```bash
# Make sure backend is running
cd backend
npm run dev

# Make sure frontend is running
cd frontend
npm run dev
```

### ❌ "Invalid credentials" error

**Fix:**
```bash
# Re-seed the database
cd backend
npm run seed
```

### ❌ "Element not found" errors

**Fix:**
- Use Cypress Test Runner in interactive mode to debug
- Check if element selector is correct
- Verify the page is fully loaded before interaction

### ❌ API requests fail (401/500 errors)

**Fix:**
```bash
# Check MongoDB is running
mongosh

# Restart backend server
cd backend
npm run dev
```

---

## Expected Test Results

All tests should pass with:
- ✅ **101 passing tests**
- ⏱️ **Total time: ~2-3 minutes**
- 📸 **0 screenshots** (only on failures)

---

## Next Steps After Tests Pass

1. ✅ Review test coverage
2. ✅ Add custom test scenarios for your use case
3. ✅ Integrate with CI/CD pipeline
4. ✅ Set up automated testing on git push

---

## Need Help?

- 📚 Full documentation: [CYPRESS_TESTING.md](CYPRESS_TESTING.md)
- 🐛 Troubleshooting: See [CYPRESS_TESTING.md#troubleshooting](CYPRESS_TESTING.md#troubleshooting)
- 💬 Cypress docs: https://docs.cypress.io/

---

**Happy Testing! 🎉**
