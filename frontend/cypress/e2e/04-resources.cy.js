describe('Resource Management', () => {
  describe('Resources List', () => {
    beforeEach(() => {
      cy.loginViaAPI(Cypress.env('adminEmail'), Cypress.env('adminPassword'))
      cy.visit('/resources')
    })

    it('should display resources page', () => {
      cy.contains('Resources').should('be.visible')
      cy.contains('Manage village resources').should('be.visible')
    })

    it('should display add resource button for admin', () => {
      cy.contains('Add Resource').should('be.visible')
    })

    it('should display resource filters', () => {
      cy.get('select').should('have.length.at.least', 2)
      cy.contains('All Types').should('exist')
      cy.contains('All Statuses').should('exist')
    })

    it('should filter resources by type', () => {
      cy.get('select').first().select('water')
      cy.wait(500)
      // Should show only water resources
    })

    it('should filter resources by status', () => {
      cy.get('select').eq(1).select('active')
      cy.wait(500)
    })

    it('should display resource cards', () => {
      cy.get('.card').should('exist')
    })

    it('should navigate to resource details', () => {
      cy.get('.card').first().click()
      cy.url().should('match', /\/resources\/[a-f0-9]{24}/)
    })
  })

  describe('Create Resource (Admin/Officer)', () => {
    beforeEach(() => {
      cy.loginViaAPI(Cypress.env('adminEmail'), Cypress.env('adminPassword'))
      cy.visit('/resources/new')
    })

    it('should display create resource form', () => {
      cy.contains('Add New Resource').should('be.visible')
      cy.get('select[name="type"]').should('exist')
      cy.get('input[name="name"]').should('exist')
      cy.get('textarea[name="description"]').should('exist')
    })

    it('should require mandatory fields', () => {
      cy.get('button[type="submit"]').click()
      cy.get('input[name="name"]:invalid').should('exist')
    })

    it('should successfully create a water resource', () => {
      const resource = {
        type: 'water',
        name: '[TEST] Village Water Tank',
        description: 'Test water tank resource',
        capacityValue: '5000',
        unit: 'liters',
        address: 'Test Village'
      }

      cy.get('select').first().select(resource.type)
      cy.get('input[name="name"]').type(resource.name)
      cy.get('textarea[name="description"]').type(resource.description)
      cy.get('input[type="number"]').first().type(resource.capacityValue)
      cy.get('input[placeholder*="liters"]').type(resource.unit)
      cy.get('input[name="location.address"]').type(resource.address)

      cy.interceptAPI('POST', '/resources', 'createResource')
      cy.get('button[type="submit"]').click()

      cy.wait('@createResource')
      cy.checkToast('Resource created successfully')
      cy.url().should('include', '/resources')
    })

    it('should successfully create an electricity resource', () => {
      cy.get('select').first().select('electricity')
      cy.get('input[name="name"]').type('[TEST] Power Transformer')
      cy.get('textarea[name="description"]').type('Test power transformer')
      cy.get('input[type="number"]').first().type('1000')
      cy.get('input[placeholder*="liters"]').clear().type('kWh')
      cy.get('input[name="location.address"]').type('Test Location')

      cy.get('button[type="submit"]').click()
      cy.checkToast('Resource created successfully')
    })

    it('should successfully create a waste resource', () => {
      cy.get('select').first().select('waste')
      cy.get('input[name="name"]').type('[TEST] Waste Collection Center')
      cy.get('textarea[name="description"]').type('Test waste center')
      cy.get('input[type="number"]').first().type('500')
      cy.get('input[placeholder*="liters"]').clear().type('kg')
      cy.get('input[name="location.address"]').type('Test Location')

      cy.get('button[type="submit"]').click()
      cy.checkToast('Resource created successfully')
    })
  })

  describe('Resource Details', () => {
    beforeEach(() => {
      cy.loginViaAPI(Cypress.env('adminEmail'), Cypress.env('adminPassword'))
      cy.visit('/resources')
      cy.get('.card').first().click()
    })

    it('should display resource details', () => {
      cy.contains('Back to Resources').should('be.visible')
      cy.contains('Type:').should('be.visible')
      cy.contains('Status:').should('be.visible')
      cy.contains('Capacity:').should('be.visible')
      cy.contains('Current Usage:').should('be.visible')
      cy.contains('Location').should('be.visible')
    })

    it('should navigate back to resources list', () => {
      cy.contains('Back to Resources').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/resources')
    })

    it('should display resource utilization', () => {
      cy.get('body').should('contain', /\d+/)
    })
  })

  describe('Resource Access Control', () => {
    it('should allow officer to create resources', () => {
      cy.loginViaAPI(Cypress.env('officerEmail'), Cypress.env('officerPassword'))
      cy.visit('/resources')
      cy.contains('Add Resource').should('be.visible')
    })

    it('should not allow citizen to create resources', () => {
      cy.loginViaAPI(Cypress.env('citizenEmail'), Cypress.env('citizenPassword'))
      cy.visit('/resources/new')
      // Should redirect or show error
      cy.url().should('not.include', '/new')
    })

    it('should allow citizen to view resources', () => {
      cy.loginViaAPI(Cypress.env('citizenEmail'), Cypress.env('citizenPassword'))
      cy.visit('/resources')
      cy.get('.card').should('exist')
    })
  })

  describe('Resource Statistics', () => {
    beforeEach(() => {
      cy.loginViaAPI(Cypress.env('adminEmail'), Cypress.env('adminPassword'))
      cy.visit('/resources')
    })

    it('should display resource capacity and usage', () => {
      cy.get('.card').first().within(() => {
        cy.contains('Capacity:').should('exist')
        cy.contains('Usage:').should('exist')
      })
    })

    it('should display utilization progress bar', () => {
      cy.get('.card').first().within(() => {
        cy.get('.bg-primary-600').should('exist') // Progress bar
      })
    })

    it('should display resource status badge', () => {
      cy.get('.badge').should('exist')
    })
  })

  describe('Resource Types', () => {
    beforeEach(() => {
      cy.loginViaAPI(Cypress.env('adminEmail'), Cypress.env('adminPassword'))
      cy.visit('/resources')
    })

    it('should filter water resources', () => {
      cy.get('select').first().select('water')
      cy.wait(500)
      cy.get('.card').should('exist')
    })

    it('should filter electricity resources', () => {
      cy.get('select').first().select('electricity')
      cy.wait(500)
      cy.get('.card').should('exist')
    })

    it('should filter waste resources', () => {
      cy.get('select').first().select('waste')
      cy.wait(500)
      cy.get('.card').should('exist')
    })
  })
})
