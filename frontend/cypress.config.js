import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    env: {
      apiUrl: 'http://localhost:5000/api',
      // Test credentials
      adminEmail: 'admin@example.com',
      adminPassword: 'password123',
      officerEmail: 'officer@example.com',
      officerPassword: 'password123',
      citizenEmail: 'citizen@example.com',
      citizenPassword: 'password123'
    },
    // Test isolation and cleanup
    testIsolation: true,
    // Retry failed tests
    retries: {
      runMode: 2,
      openMode: 0
    }
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
})
