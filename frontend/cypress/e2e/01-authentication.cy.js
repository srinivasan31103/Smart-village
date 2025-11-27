describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  describe('Login Page', () => {
    it('should redirect to login page when not authenticated', () => {
      cy.url().should('include', '/login')
      cy.contains('Smart Village').should('be.visible')
      cy.contains('Login').should('be.visible')
    })

    it('should display login form with all fields', () => {
      cy.visit('/login')
      cy.get('input[name="email"]').should('be.visible')
      cy.get('input[name="password"]').should('be.visible')
      cy.get('button[type="submit"]').should('be.visible')
      cy.contains('Register here').should('be.visible')
    })

    it('should show validation errors for empty fields', () => {
      cy.visit('/login')
      cy.get('button[type="submit"]').click()
      cy.get('input[name="email"]:invalid').should('exist')
      cy.get('input[name="password"]:invalid').should('exist')
    })

    it('should show error for invalid credentials', () => {
      cy.visit('/login')
      cy.get('input[name="email"]').type('invalid@example.com')
      cy.get('input[name="password"]').type('wrongpassword')
      cy.get('button[type="submit"]').click()
      cy.checkToast('Invalid credentials', 'error')
    })

    it('should successfully login as admin', () => {
      cy.login(Cypress.env('adminEmail'), Cypress.env('adminPassword'))
      cy.url().should('include', '/dashboard')
      cy.contains('Welcome back').should('be.visible')
      cy.contains('admin@example.com').should('be.visible')
    })

    it('should successfully login as officer', () => {
      cy.login(Cypress.env('officerEmail'), Cypress.env('officerPassword'))
      cy.url().should('include', '/dashboard')
      cy.contains('Welcome back').should('be.visible')
    })

    it('should successfully login as citizen', () => {
      cy.login(Cypress.env('citizenEmail'), Cypress.env('citizenPassword'))
      cy.url().should('include', '/dashboard')
      cy.contains('Welcome back').should('be.visible')
    })

    it('should persist authentication after page reload', () => {
      cy.login(Cypress.env('adminEmail'), Cypress.env('adminPassword'))
      cy.reload()
      cy.url().should('include', '/dashboard')
      cy.window().its('localStorage.token').should('exist')
    })
  })

  describe('Registration Page', () => {
    it('should navigate to registration page', () => {
      cy.visit('/login')
      cy.contains('Register here').click()
      cy.url().should('include', '/register')
      cy.contains('Create your account').should('be.visible')
    })

    it('should display all registration fields', () => {
      cy.visit('/register')
      cy.get('input[name="name"]').should('be.visible')
      cy.get('input[name="email"]').should('be.visible')
      cy.get('input[name="password"]').should('be.visible')
      cy.get('input[name="confirmPassword"]').should('be.visible')
      cy.get('input[name="phone"]').should('be.visible')
      cy.get('select[name="role"]').should('be.visible')
    })

    it('should show error when passwords do not match', () => {
      cy.visit('/register')
      cy.get('input[name="password"]').type('password123')
      cy.get('input[name="confirmPassword"]').type('differentpassword')
      cy.get('button[type="submit"]').click()
      cy.contains('Passwords do not match').should('be.visible')
    })

    it('should show error for existing email', () => {
      cy.visit('/register')
      cy.fillForm({
        name: 'Test User',
        email: Cypress.env('adminEmail'), // Already exists
        password: 'password123',
        confirmPassword: 'password123',
        phone: '+1234567890'
      })
      cy.get('button[type="submit"]').click()
      cy.checkToast('already exists', 'error')
    })
  })

  describe('Logout', () => {
    it('should successfully logout', () => {
      cy.login(Cypress.env('adminEmail'), Cypress.env('adminPassword'))
      cy.get('[title="Logout"]').click()
      cy.url().should('include', '/login')
      cy.window().its('localStorage.token').should('not.exist')
    })
  })

  describe('Protected Routes', () => {
    it('should redirect to login when accessing protected route without auth', () => {
      cy.visit('/dashboard')
      cy.url().should('include', '/login')
    })

    it('should redirect to login when token is invalid', () => {
      cy.window().then((win) => {
        win.localStorage.setItem('token', 'invalid-token')
      })
      cy.visit('/dashboard')
      cy.url().should('include', '/login')
    })
  })
})
