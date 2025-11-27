describe('Complaints Management', () => {
  describe('Complaints List', () => {
    beforeEach(() => {
      cy.loginViaAPI(Cypress.env('adminEmail'), Cypress.env('adminPassword'))
      cy.visit('/complaints')
    })

    it('should display complaints page title', () => {
      cy.contains('Complaints').should('be.visible')
      cy.contains('Manage and track all complaints').should('be.visible')
    })

    it('should display new complaint button', () => {
      cy.contains('New Complaint').should('be.visible')
    })

    it('should display filters section', () => {
      cy.contains('Filters').should('be.visible')
      cy.get('select[name="category"]').should('exist')
      cy.get('select[name="status"]').should('exist')
      cy.get('select[name="priority"]').should('exist')
      cy.contains('Clear Filters').should('be.visible')
    })

    it('should filter complaints by category', () => {
      cy.interceptAPI('GET', '/complaints*', 'getComplaints')
      cy.get('select[name="category"]').select('water')
      cy.wait('@getComplaints')
      cy.url().should('include', 'category=water')
    })

    it('should filter complaints by status', () => {
      cy.interceptAPI('GET', '/complaints*', 'getComplaints')
      cy.get('select[name="status"]').select('pending')
      cy.wait('@getComplaints')
      cy.url().should('include', 'status=pending')
    })

    it('should clear all filters', () => {
      cy.get('select[name="category"]').select('water')
      cy.get('select[name="status"]').select('pending')
      cy.contains('Clear Filters').click()
      cy.get('select[name="category"]').should('have.value', '')
      cy.get('select[name="status"]').should('have.value', '')
    })

    it('should display complaints table', () => {
      cy.get('table').should('exist')
      cy.contains('Title').should('be.visible')
      cy.contains('Category').should('be.visible')
      cy.contains('Priority').should('be.visible')
      cy.contains('Status').should('be.visible')
      cy.contains('Date').should('be.visible')
    })

    it('should navigate to complaint details', () => {
      cy.get('table tbody tr').first().find('a').contains('View Details').click()
      cy.url().should('match', /\/complaints\/[a-f0-9]{24}/)
    })
  })

  describe('Create Complaint', () => {
    beforeEach(() => {
      cy.loginViaAPI(Cypress.env('citizenEmail'), Cypress.env('citizenPassword'))
      cy.visit('/complaints/new')
    })

    it('should display create complaint form', () => {
      cy.contains('Report New Complaint').should('be.visible')
      cy.get('input[name="title"]').should('be.visible')
      cy.get('textarea[name="description"]').should('be.visible')
      cy.get('select[name="category"]').should('be.visible')
      cy.contains('Submit Complaint').should('be.visible')
    })

    it('should require mandatory fields', () => {
      cy.get('button[type="submit"]').click()
      cy.get('input[name="title"]:invalid').should('exist')
      cy.get('textarea[name="description"]:invalid').should('exist')
    })

    it('should successfully create a complaint', () => {
      const complaint = {
        title: '[TEST] Water Leakage Issue',
        description: 'There is a water leakage in the main pipeline near the village square.',
        category: 'water',
        subCategory: 'Pipeline Leak',
        address: 'Village Square, Smart Village'
      }

      cy.interceptAPI('POST', '/complaints', 'createComplaint')

      cy.get('input[name="title"]').type(complaint.title)
      cy.get('textarea[name="description"]').type(complaint.description)
      cy.get('select[name="category"]').select(complaint.category)
      cy.get('input[name="subCategory"]').type(complaint.subCategory)
      cy.get('input[id="address"]').type(complaint.address)

      cy.get('button[type="submit"]').click()

      cy.wait('@createComplaint')
      cy.checkToast('Complaint submitted successfully')
      cy.url().should('include', '/complaints')
    })

    it('should allow photo upload', () => {
      cy.contains('Add Photos').should('be.visible')
      // Note: File upload testing requires fixture files
    })

    it('should display map for location selection', () => {
      cy.contains('Location').should('be.visible')
      cy.contains('Use Current Location').should('be.visible')
    })

    it('should allow canceling complaint creation', () => {
      cy.get('input[name="title"]').type('Test Complaint')
      cy.contains('Cancel').click()
      cy.url().should('include', '/complaints')
    })
  })

  describe('Complaint Details', () => {
    let complaintId

    before(() => {
      // Create a test complaint
      cy.loginViaAPI(Cypress.env('citizenEmail'), Cypress.env('citizenPassword'))
      cy.createComplaint({
        title: '[TEST] Complaint for Details View',
        description: 'This is a test complaint for viewing details',
        category: 'water',
        location: {
          type: 'Point',
          coordinates: [77.5946, 12.9716],
          address: 'Test Location'
        }
      }).then((complaint) => {
        complaintId = complaint._id
      })
    })

    beforeEach(() => {
      cy.loginViaAPI(Cypress.env('adminEmail'), Cypress.env('adminPassword'))
      cy.visit(`/complaints/${complaintId}`)
    })

    it('should display complaint details', () => {
      cy.contains('[TEST] Complaint for Details View').should('be.visible')
      cy.contains('Description').should('be.visible')
      cy.contains('Category').should('be.visible')
      cy.contains('Status').should('be.visible')
      cy.contains('Priority').should('be.visible')
    })

    it('should display back button', () => {
      cy.contains('Back to Complaints').should('be.visible')
    })

    it('should navigate back to complaints list', () => {
      cy.contains('Back to Complaints').click()
      cy.url().should('include', '/complaints')
      cy.url().should('not.include', complaintId)
    })

    it('should allow admin to update complaint status', () => {
      cy.contains('Update Complaint').should('be.visible')
      cy.get('select').first().select('in-progress')
      cy.contains('Update Complaint').click()
      cy.checkToast('Complaint updated successfully')
    })

    it('should display comment section', () => {
      cy.contains('Comments').should('be.visible')
      cy.get('textarea[placeholder*="Add a comment"]').should('be.visible')
    })

    it('should allow adding comments', () => {
      const comment = 'This is a test comment'
      cy.get('textarea[placeholder*="Add a comment"]').type(comment)
      cy.contains('Add Comment').click()
      cy.checkToast('Comment added')
      cy.contains(comment).should('be.visible')
    })

    after(() => {
      // Cleanup: Delete test complaint
      cy.loginViaAPI(Cypress.env('adminEmail'), Cypress.env('adminPassword'))
      cy.cleanupComplaints()
    })
  })

  describe('Admin Complaint Management', () => {
    beforeEach(() => {
      cy.loginViaAPI(Cypress.env('adminEmail'), Cypress.env('adminPassword'))
      cy.visit('/complaints')
    })

    it('should show reported by column for admin', () => {
      cy.contains('Reported By').should('be.visible')
    })

    it('should allow admin to view all complaints', () => {
      cy.get('table tbody tr').should('exist')
    })
  })

  describe('Citizen Complaint View', () => {
    beforeEach(() => {
      cy.loginViaAPI(Cypress.env('citizenEmail'), Cypress.env('citizenPassword'))
      cy.visit('/complaints')
    })

    it('should only show citizen\'s own complaints', () => {
      // Citizen should not see "Reported By" column
      cy.contains('Reported By').should('not.exist')
    })

    it('should allow citizen to create new complaint', () => {
      cy.contains('New Complaint').should('be.visible')
      cy.contains('New Complaint').click()
      cy.url().should('include', '/complaints/new')
    })
  })

  describe('Complaint Pagination', () => {
    beforeEach(() => {
      cy.loginViaAPI(Cypress.env('adminEmail'), Cypress.env('adminPassword'))
      cy.visit('/complaints')
    })

    it('should display pagination controls if needed', () => {
      // Check if pagination exists (depends on data)
      cy.get('body').then(($body) => {
        if ($body.text().includes('Page')) {
          cy.contains('Next').should('be.visible')
          cy.contains('Previous').should('be.visible')
        }
      })
    })
  })
})
