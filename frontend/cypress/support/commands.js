// ***********************************************
// Custom Cypress Commands for Smart Village
// ***********************************************

// Login command
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login')
  cy.get('input[name="email"]').type(email)
  cy.get('input[name="password"]').type(password)
  cy.get('button[type="submit"]').click()
  cy.url().should('include', '/dashboard')
  cy.window().its('localStorage.token').should('exist')
})

// Login via API (faster for setup)
Cypress.Commands.add('loginViaAPI', (email, password) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/auth/login`,
    body: { email, password }
  }).then((response) => {
    expect(response.status).to.eq(200)
    expect(response.body).to.have.property('token')
    window.localStorage.setItem('token', response.body.token)
    window.localStorage.setItem('user', JSON.stringify(response.body.user))
  })
})

// Logout command
Cypress.Commands.add('logout', () => {
  cy.window().then((win) => {
    win.localStorage.removeItem('token')
    win.localStorage.removeItem('user')
  })
  cy.visit('/login')
})

// Create complaint via API
Cypress.Commands.add('createComplaint', (complaintData) => {
  cy.window().then((win) => {
    const token = win.localStorage.getItem('token')

    const formData = new FormData()
    formData.append('title', complaintData.title)
    formData.append('description', complaintData.description)
    formData.append('category', complaintData.category)
    formData.append('location', JSON.stringify(complaintData.location))

    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/complaints`,
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    }).then((response) => {
      expect(response.status).to.eq(201)
      return response.body.complaint
    })
  })
})

// Create resource via API
Cypress.Commands.add('createResource', (resourceData) => {
  cy.window().then((win) => {
    const token = win.localStorage.getItem('token')

    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/resources`,
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: resourceData
    }).then((response) => {
      expect(response.status).to.eq(201)
      return response.body.resource
    })
  })
})

// Delete all test complaints (cleanup)
Cypress.Commands.add('cleanupComplaints', () => {
  cy.window().then((win) => {
    const token = win.localStorage.getItem('token')

    cy.request({
      method: 'GET',
      url: `${Cypress.env('apiUrl')}/complaints`,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).then((response) => {
      const complaints = response.body.complaints

      complaints.forEach((complaint) => {
        if (complaint.title.includes('[TEST]')) {
          cy.request({
            method: 'DELETE',
            url: `${Cypress.env('apiUrl')}/complaints/${complaint._id}`,
            headers: {
              'Authorization': `Bearer ${token}`
            },
            failOnStatusCode: false
          })
        }
      })
    })
  })
})

// Wait for API response
Cypress.Commands.add('waitForAPI', (alias) => {
  cy.wait(alias).its('response.statusCode').should('eq', 200)
})

// Check if element is visible and enabled
Cypress.Commands.add('shouldBeInteractive', { prevSubject: 'element' }, (subject) => {
  cy.wrap(subject).should('be.visible').and('not.be.disabled')
})

// Fill form helper
Cypress.Commands.add('fillForm', (formData) => {
  Object.keys(formData).forEach((key) => {
    cy.get(`[name="${key}"]`).clear().type(formData[key])
  })
})

// Check toast notification
Cypress.Commands.add('checkToast', (message, type = 'success') => {
  cy.get('.Toastify__toast', { timeout: 10000 })
    .should('be.visible')
    .and('contain', message)
})

// Intercept API calls
Cypress.Commands.add('interceptAPI', (method, path, alias) => {
  cy.intercept(method, `${Cypress.env('apiUrl')}${path}`).as(alias)
})
