describe('Dashboard', () => {
  describe('Admin Dashboard', () => {
    beforeEach(() => {
      cy.loginViaAPI(Cypress.env('adminEmail'), Cypress.env('adminPassword'))
      cy.visit('/dashboard')
    })

    it('should display dashboard title and user name', () => {
      cy.contains('Dashboard').should('be.visible')
      cy.contains('Welcome back').should('be.visible')
      cy.contains('Admin User').should('be.visible')
    })

    it('should display all admin statistics cards', () => {
      cy.contains('Total Complaints').should('be.visible')
      cy.contains('Pending').should('be.visible')
      cy.contains('In Progress').should('be.visible')
      cy.contains('Resolved').should('be.visible')
      cy.contains('Total Resources').should('be.visible')
      cy.contains('Active Resources').should('be.visible')
      cy.contains('Total Users').should('be.visible')
      cy.contains('Resolution Rate').should('be.visible')
    })

    it('should display statistics with numeric values', () => {
      cy.get('.card').should('have.length.at.least', 4)
      // Check that cards contain numbers
      cy.contains('Total Complaints').parent().parent().should('contain', /\d+/)
    })

    it('should display charts for admin', () => {
      cy.contains('Complaints by Category').should('be.visible')
      cy.contains('Complaints by Status').should('be.visible')
      cy.get('canvas').should('have.length.at.least', 2)
    })

    it('should display recent complaints table', () => {
      cy.contains('Recent Complaints').should('be.visible')
      cy.contains('View All').should('be.visible')
      cy.get('table').should('exist')
    })

    it('should navigate to complaints when clicking View All', () => {
      cy.contains('View All').first().click()
      cy.url().should('include', '/complaints')
    })

    it('should display quick actions', () => {
      cy.contains('Quick Actions').should('be.visible')
      cy.contains('Report New Complaint').should('be.visible')
      cy.contains('View All Complaints').should('be.visible')
      cy.contains('View Resources').should('be.visible')
    })

    it('should navigate using quick actions', () => {
      cy.contains('Report New Complaint').click()
      cy.url().should('include', '/complaints/new')
    })
  })

  describe('Citizen Dashboard', () => {
    beforeEach(() => {
      cy.loginViaAPI(Cypress.env('citizenEmail'), Cypress.env('citizenPassword'))
      cy.visit('/dashboard')
    })

    it('should display citizen-specific statistics', () => {
      cy.contains('My Complaints').should('be.visible')
      cy.contains('Pending').should('be.visible')
      cy.contains('Resolved').should('be.visible')
      // Should NOT see admin stats
      cy.contains('Total Resources').should('not.exist')
      cy.contains('Total Users').should('not.exist')
    })

    it('should not display charts for citizens', () => {
      cy.contains('Complaints by Category').should('not.exist')
      cy.get('canvas').should('not.exist')
    })

    it('should display only user\'s complaints in recent section', () => {
      cy.contains('Recent Complaints').should('be.visible')
    })
  })

  describe('Sidebar Navigation', () => {
    beforeEach(() => {
      cy.loginViaAPI(Cypress.env('adminEmail'), Cypress.env('adminPassword'))
      cy.visit('/dashboard')
    })

    it('should display all navigation items for admin', () => {
      cy.contains('Dashboard').should('be.visible')
      cy.contains('Complaints').should('be.visible')
      cy.contains('Resources').should('be.visible')
      cy.contains('Users').should('be.visible')
      cy.contains('Profile').should('be.visible')
    })

    it('should highlight active navigation item', () => {
      cy.contains('Dashboard').should('have.class', 'bg-primary-600')
    })

    it('should navigate to different pages', () => {
      cy.contains('Complaints').click()
      cy.url().should('include', '/complaints')
      cy.contains('Complaints').should('have.class', 'bg-primary-600')

      cy.contains('Resources').click()
      cy.url().should('include', '/resources')

      cy.contains('Profile').click()
      cy.url().should('include', '/profile')
    })
  })

  describe('Navbar', () => {
    beforeEach(() => {
      cy.loginViaAPI(Cypress.env('adminEmail'), Cypress.env('adminPassword'))
      cy.visit('/dashboard')
    })

    it('should display user information in navbar', () => {
      cy.get('nav').should('contain', 'Admin User')
      cy.get('nav').should('contain', 'admin')
    })

    it('should display notification bell', () => {
      cy.get('[title="Logout"]').should('exist')
    })

    it('should navigate to profile when clicking user info', () => {
      cy.contains('Admin User').click()
      cy.url().should('include', '/profile')
    })
  })

  describe('Responsive Design', () => {
    it('should be responsive on mobile', () => {
      cy.viewport('iphone-x')
      cy.loginViaAPI(Cypress.env('adminEmail'), Cypress.env('adminPassword'))
      cy.visit('/dashboard')
      cy.contains('Dashboard').should('be.visible')
    })

    it('should be responsive on tablet', () => {
      cy.viewport('ipad-2')
      cy.loginViaAPI(Cypress.env('adminEmail'), Cypress.env('adminPassword'))
      cy.visit('/dashboard')
      cy.contains('Dashboard').should('be.visible')
      cy.get('.card').should('be.visible')
    })
  })
})
