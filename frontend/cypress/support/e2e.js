// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Global before hook - runs once before all tests
before(() => {
  // Ensure backend is running
  cy.request({
    url: `${Cypress.env('apiUrl')}/health`,
    failOnStatusCode: false
  }).then((response) => {
    if (response.status !== 200) {
      throw new Error('Backend server is not running! Please start the backend first.')
    }
  })
})

// Before each test
beforeEach(() => {
  // Clear local storage
  cy.clearLocalStorage()

  // Clear cookies
  cy.clearCookies()

  // Set viewport
  cy.viewport(1280, 720)
})

// After each test
afterEach(() => {
  // Take screenshot on failure
  cy.on('fail', (error) => {
    cy.screenshot('failed-test')
    throw error
  })
})

// Global error handler
Cypress.on('uncaught:exception', (err, runnable) => {
  // Returning false here prevents Cypress from failing the test
  // on certain expected errors
  if (err.message.includes('ResizeObserver')) {
    return false
  }
  if (err.message.includes('Cannot read properties of null')) {
    return false
  }
  return true
})
