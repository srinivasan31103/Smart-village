# 🧪 Cypress E2E Testing Guide

## Overview

This document provides comprehensive information about the Cypress E2E testing setup for the Smart Village Management System.

---

## 📋 Table of Contents

1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Running Tests](#running-tests)
4. [Test Structure](#test-structure)
5. [Custom Commands](#custom-commands)
6. [Test Suites](#test-suites)
7. [Fixtures](#fixtures)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## 🚀 Installation

### Prerequisites

Before running Cypress tests, ensure you have:

1. **Backend server running** on `http://localhost:5000`
2. **Frontend development server running** on `http://localhost:5173`
3. **MongoDB database** with seeded test data

### Install Dependencies

```bash
cd frontend
npm install
```

This will install Cypress (version 13.6.2) and all required dependencies.

---

## ⚙️ Configuration

### Cypress Configuration File

The Cypress configuration is located at [frontend/cypress.config.js](frontend/cypress.config.js):

```javascript
export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    env: {
      apiUrl: 'http://localhost:5000/api',
      adminEmail: 'admin@example.com',
      adminPassword: 'password123',
      officerEmail: 'officer@example.com',
      officerPassword: 'password123',
      citizenEmail: 'citizen@example.com',
      citizenPassword: 'password123',
      mapboxToken: 'your_mapbox_token'
    },
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000
  }
})
```

### Environment Variables

Test credentials are configured in the Cypress config file. You can override them by creating a `cypress.env.json` file:

```json
{
  "adminEmail": "admin@example.com",
  "adminPassword": "password123",
  "officerEmail": "officer@example.com",
  "officerPassword": "password123",
  "citizenEmail": "citizen@example.com",
  "citizenPassword": "password123"
}
```

---

## 🏃 Running Tests

### Open Cypress Test Runner (Interactive Mode)

```bash
cd frontend
npm run cypress:open
```

This opens the Cypress Test Runner where you can:
- Select and run individual test files
- See tests execute in real-time
- Debug test failures
- Time-travel through test steps

### Run All Tests (Headless Mode)

```bash
cd frontend
npm run cypress:run
```

This runs all tests in headless mode, ideal for CI/CD pipelines.

### Run Specific Test Suite

```bash
cd frontend
npx cypress run --spec "cypress/e2e/01-authentication.cy.js"
```

### Run Tests in Headed Mode

```bash
cd frontend
npm run test:e2e:headed
```

### Run Tests with Specific Browser

```bash
cd frontend
npx cypress run --browser chrome
npx cypress run --browser firefox
npx cypress run --browser edge
```

---

## 📁 Test Structure

### Directory Structure

```
frontend/
└── cypress/
    ├── e2e/
    │   ├── 01-authentication.cy.js    # Authentication tests
    │   ├── 02-dashboard.cy.js         # Dashboard tests
    │   ├── 03-complaints.cy.js        # Complaints management tests
    │   ├── 04-resources.cy.js         # Resources management tests
    │   ├── 05-users.cy.js             # User management tests (Admin)
    │   └── 06-profile.cy.js           # Profile management tests
    ├── fixtures/
    │   ├── users.json                 # User test data
    │   ├── complaints.json            # Complaint test data
    │   ├── resources.json             # Resource test data
    │   └── comments.json              # Comment test data
    └── support/
        ├── commands.js                # Custom Cypress commands
        └── e2e.js                     # Global hooks and configuration
```

### Test File Naming Convention

- **Prefix with numbers** for execution order: `01-`, `02-`, `03-`
- **Use descriptive names**: `authentication.cy.js`, `dashboard.cy.js`
- **Suffix with `.cy.js`**: Required for Cypress to recognize test files

---

## 🛠️ Custom Commands

We've created several custom Cypress commands to make testing easier. These are defined in [frontend/cypress/support/commands.js](frontend/cypress/support/commands.js).

### Authentication Commands

#### `cy.login(email, password)`

Logs in via the UI form.

```javascript
cy.login('admin@example.com', 'password123')
cy.url().should('include', '/dashboard')
```

#### `cy.loginViaAPI(email, password)`

Logs in via API (faster for test setup).

```javascript
cy.loginViaAPI(Cypress.env('adminEmail'), Cypress.env('adminPassword'))
cy.visit('/dashboard')
```

#### `cy.logout()`

Logs out the current user.

```javascript
cy.logout()
cy.url().should('include', '/login')
```

### Data Creation Commands

#### `cy.createComplaint(complaintData)`

Creates a complaint via API.

```javascript
cy.createComplaint({
  title: 'Test Complaint',
  description: 'Test description',
  category: 'water',
  location: {
    address: 'Test Address',
    coordinates: { longitude: 77.5946, latitude: 12.9716 }
  }
})
```

#### `cy.createResource(resourceData)`

Creates a resource via API (Admin/Officer only).

```javascript
cy.createResource({
  type: 'water',
  name: 'Test Tank',
  capacity: { value: 5000, unit: 'liters' },
  currentUsage: 2000
})
```

### Cleanup Commands

#### `cy.cleanupComplaints()`

Deletes all test complaints (title starts with [TEST]).

```javascript
cy.cleanupComplaints()
```

#### `cy.cleanupResources()`

Deletes all test resources (name starts with [TEST]).

```javascript
cy.cleanupResources()
```

### Utility Commands

#### `cy.interceptAPI(method, url, alias)`

Sets up API request interception.

```javascript
cy.interceptAPI('POST', '/complaints', 'createComplaint')
cy.get('button[type="submit"]').click()
cy.wait('@createComplaint')
```

#### `cy.checkToast(message)`

Verifies toast notification appears.

```javascript
cy.checkToast('Complaint created successfully')
```

---

## 📝 Test Suites

### 1. Authentication Tests ([01-authentication.cy.js](frontend/cypress/e2e/01-authentication.cy.js))

**Coverage:**
- Login page display
- Successful login (Admin, Officer, Citizen)
- Failed login attempts
- Form validation
- Registration flow
- Logout functionality
- Protected routes

**Key Tests:**
```javascript
it('should successfully login as admin', () => {
  cy.login(Cypress.env('adminEmail'), Cypress.env('adminPassword'))
  cy.url().should('include', '/dashboard')
  cy.contains('Dashboard').should('be.visible')
})

it('should redirect to login when accessing protected route', () => {
  cy.visit('/dashboard')
  cy.url().should('include', '/login')
})
```

### 2. Dashboard Tests ([02-dashboard.cy.js](frontend/cypress/e2e/02-dashboard.cy.js))

**Coverage:**
- Dashboard statistics (KPIs)
- Chart visualizations
- Recent complaints display
- Role-based dashboard views
- Navigation links

**Key Tests:**
```javascript
it('should display statistics cards', () => {
  cy.loginViaAPI(Cypress.env('adminEmail'), Cypress.env('adminPassword'))
  cy.visit('/dashboard')

  cy.contains('Total Complaints').should('be.visible')
  cy.contains('Total Resources').should('be.visible')
  cy.contains('Active Users').should('be.visible')
})
```

### 3. Complaints Tests ([03-complaints.cy.js](frontend/cypress/e2e/03-complaints.cy.js))

**Coverage:**
- Complaints list view
- Filtering and search
- Create complaint (with photo upload and map)
- Complaint details view
- Status updates
- Comment system
- Role-based access control

**Key Tests:**
```javascript
it('should successfully create a complaint with location', () => {
  cy.loginViaAPI(Cypress.env('citizenEmail'), Cypress.env('citizenPassword'))
  cy.visit('/complaints/new')

  cy.get('input[name="title"]').type('[TEST] Water Leak')
  cy.get('textarea[name="description"]').type('Water leak description')
  cy.get('select[name="category"]').select('water')

  // Click on map to set location
  cy.get('.mapboxgl-canvas').click(400, 300)

  cy.interceptAPI('POST', '/complaints', 'createComplaint')
  cy.get('button[type="submit"]').click()
  cy.wait('@createComplaint')
  cy.checkToast('Complaint submitted successfully')
})
```

### 4. Resources Tests ([04-resources.cy.js](frontend/cypress/e2e/04-resources.cy.js))

**Coverage:**
- Resources list view
- Filtering by type and status
- Create resource (Admin/Officer)
- Resource details view
- Usage statistics
- Access control (Citizens can view, not create)

**Key Tests:**
```javascript
it('should successfully create a water resource', () => {
  cy.loginViaAPI(Cypress.env('adminEmail'), Cypress.env('adminPassword'))
  cy.visit('/resources/new')

  cy.get('select[name="type"]').select('water')
  cy.get('input[name="name"]').type('[TEST] Village Water Tank')
  cy.get('input[type="number"]').type('5000')
  cy.get('input[name="location.address"]').type('Test Village')

  cy.get('button[type="submit"]').click()
  cy.checkToast('Resource created successfully')
})
```

### 5. Users Tests ([05-users.cy.js](frontend/cypress/e2e/05-users.cy.js))

**Coverage:**
- Users list (Admin only)
- Create new users
- Edit user details
- Delete users
- Role management
- Search and filter
- Bulk operations

**Key Tests:**
```javascript
it('should successfully create a new user', () => {
  cy.loginViaAPI(Cypress.env('adminEmail'), Cypress.env('adminPassword'))
  cy.visit('/users')

  cy.contains('Add User').click()
  cy.get('input[name="name"]').type('Test Officer')
  cy.get('input[name="email"]').type('test.officer@example.com')
  cy.get('select[name="role"]').select('officer')

  cy.get('button[type="submit"]').click()
  cy.checkToast('User created successfully')
})
```

### 6. Profile Tests ([06-profile.cy.js](frontend/cypress/e2e/06-profile.cy.js))

**Coverage:**
- Profile page display
- Update personal information
- Update address
- Change password
- Form validation
- Profile persistence

**Key Tests:**
```javascript
it('should successfully update profile information', () => {
  cy.loginViaAPI(Cypress.env('adminEmail'), Cypress.env('adminPassword'))
  cy.visit('/profile')

  cy.get('input[name="phone"]').clear().type('9876543210')
  cy.get('button[type="submit"]').click()
  cy.checkToast('Profile updated successfully')

  cy.reload()
  cy.get('input[name="phone"]').should('have.value', '9876543210')
})
```

---

## 📦 Fixtures

Fixtures are static test data files located in `cypress/fixtures/`.

### Available Fixtures

1. **users.json** - Test user data
2. **complaints.json** - Sample complaint data
3. **resources.json** - Sample resource data
4. **comments.json** - Sample comments

### Using Fixtures in Tests

```javascript
describe('Test with Fixtures', () => {
  it('should create complaint using fixture data', () => {
    cy.fixture('complaints').then((complaints) => {
      cy.createComplaint(complaints.waterComplaint)
    })
  })
})
```

---

## ✅ Best Practices

### 1. Test Independence

Each test should be independent and not rely on other tests:

```javascript
// Good
beforeEach(() => {
  cy.loginViaAPI(Cypress.env('adminEmail'), Cypress.env('adminPassword'))
  cy.visit('/dashboard')
})

// Bad - Don't rely on previous test state
it('test 1', () => { cy.login(...) })
it('test 2', () => { /* assumes already logged in */ })
```

### 2. Use API for Setup

Use API commands for test setup to make tests faster:

```javascript
// Fast - uses API
beforeEach(() => {
  cy.loginViaAPI(email, password)
  cy.visit('/page')
})

// Slow - uses UI
beforeEach(() => {
  cy.visit('/login')
  cy.get('input[name="email"]').type(email)
  cy.get('input[name="password"]').type(password)
  cy.get('button').click()
})
```

### 3. Clean Up Test Data

Use `[TEST]` prefix for test data and clean up after tests:

```javascript
afterEach(() => {
  cy.cleanupComplaints()
  cy.cleanupResources()
})
```

### 4. Use Descriptive Selectors

```javascript
// Good
cy.get('[data-testid="submit-button"]').click()
cy.get('input[name="email"]').type('email@example.com')

// Avoid
cy.get('.btn-primary').click()
cy.get('input').first().type('email@example.com')
```

### 5. Use Aliases for Cleaner Code

```javascript
cy.get('input[name="email"]').as('emailInput')
cy.get('@emailInput').type('test@example.com')
cy.get('@emailInput').should('have.value', 'test@example.com')
```

### 6. Wait for API Requests

```javascript
cy.interceptAPI('POST', '/complaints', 'createComplaint')
cy.get('button[type="submit"]').click()
cy.wait('@createComplaint').its('response.statusCode').should('eq', 201)
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Tests Timeout

**Problem:** Tests fail with timeout errors.

**Solution:**
- Increase timeout in `cypress.config.js`:
  ```javascript
  defaultCommandTimeout: 10000,
  requestTimeout: 10000
  ```
- Check if backend server is running
- Check if API endpoints are responding

#### 2. Login Fails

**Problem:** Login tests fail with "Invalid credentials".

**Solution:**
- Run seed script to create test users:
  ```bash
  cd backend
  npm run seed
  ```
- Verify credentials in `cypress.config.js` match seed data

#### 3. Element Not Found

**Problem:** `cy.get()` fails to find elements.

**Solution:**
- Add explicit waits:
  ```javascript
  cy.get('button', { timeout: 10000 }).should('be.visible')
  ```
- Check if element exists in the DOM
- Use Cypress Test Runner to debug

#### 4. API Requests Fail

**Problem:** API requests return 401 or 500 errors.

**Solution:**
- Check if backend server is running
- Verify token is stored correctly:
  ```javascript
  cy.window().then((win) => {
    console.log(win.localStorage.getItem('token'))
  })
  ```
- Check MongoDB connection

#### 5. Map Not Loading

**Problem:** Mapbox map doesn't load in tests.

**Solution:**
- Add Mapbox token to `cypress.config.js`:
  ```javascript
  env: {
    mapboxToken: 'your_mapbox_token_here'
  }
  ```
- Increase wait time for map to load

### Debug Mode

Run Cypress with debug output:

```bash
DEBUG=cypress:* npm run cypress:run
```

### Screenshots and Videos

- **Screenshots** are automatically taken on test failures
- Located in `cypress/screenshots/`
- **Videos** can be enabled in `cypress.config.js`:
  ```javascript
  video: true
  ```

---

## 📊 Test Coverage

### Current Test Statistics

| Category | Test Suites | Test Cases | Coverage |
|----------|-------------|------------|----------|
| **Authentication** | 1 | 12 tests | Login, Register, Logout, Protected Routes |
| **Dashboard** | 1 | 8 tests | Stats, Charts, Navigation |
| **Complaints** | 1 | 25 tests | CRUD, Filters, Comments, Access Control |
| **Resources** | 1 | 18 tests | CRUD, Filters, Access Control, Statistics |
| **Users** | 1 | 20 tests | CRUD, Search, Roles, Bulk Operations |
| **Profile** | 1 | 18 tests | Update Info, Change Password, Validation |
| **TOTAL** | **6** | **101 tests** | **Full E2E Coverage** |

---

## 🚀 CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  cypress:
    runs-on: ubuntu-latest

    services:
      mongodb:
        image: mongo:7.0
        ports:
          - 27017:27017

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install backend dependencies
        run: cd backend && npm install

      - name: Seed database
        run: cd backend && npm run seed

      - name: Start backend server
        run: cd backend && npm start &

      - name: Install frontend dependencies
        run: cd frontend && npm install

      - name: Run Cypress tests
        run: cd frontend && npm run test:e2e

      - name: Upload screenshots on failure
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: cypress-screenshots
          path: frontend/cypress/screenshots
```

---

## 📚 Additional Resources

- [Cypress Documentation](https://docs.cypress.io/)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Cypress API Reference](https://docs.cypress.io/api/table-of-contents)
- [Cypress Examples](https://example.cypress.io/)

---

## 🎯 Next Steps

1. **Run the tests:**
   ```bash
   cd frontend
   npm install
   npm run cypress:open
   ```

2. **Review test results** and fix any failures

3. **Add more tests** as new features are developed

4. **Integrate with CI/CD** pipeline for automated testing

5. **Monitor test coverage** and add tests for edge cases

---

## 📧 Support

If you encounter any issues with the tests, please:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review test logs and screenshots
3. Ensure backend and frontend servers are running
4. Verify database is seeded with test data

---

**Happy Testing! 🎉**
