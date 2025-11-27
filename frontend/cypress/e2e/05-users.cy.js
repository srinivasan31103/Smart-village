describe('User Management (Admin Only)', () => {
  describe('Users List', () => {
    beforeEach(() => {
      cy.loginViaAPI(Cypress.env('adminEmail'), Cypress.env('adminPassword'))
      cy.visit('/users')
    })

    it('should display users page', () => {
      cy.contains('Users').should('be.visible')
      cy.contains('Manage system users').should('be.visible')
    })

    it('should display all users in a table', () => {
      cy.get('table').should('exist')
      cy.get('thead').within(() => {
        cy.contains('Name').should('exist')
        cy.contains('Email').should('exist')
        cy.contains('Role').should('exist')
        cy.contains('Status').should('exist')
      })
    })

    it('should display user role badges', () => {
      cy.get('.badge').should('exist')
      cy.get('.badge').should('contain.text', 'Admin')
    })

    it('should display user status', () => {
      cy.get('tbody tr').should('have.length.at.least', 1)
      cy.get('tbody tr').first().within(() => {
        cy.get('td').should('contain', '@')
      })
    })

    it('should show action buttons for each user', () => {
      cy.get('tbody tr').first().within(() => {
        cy.get('button').should('exist')
      })
    })
  })

  describe('Create User', () => {
    beforeEach(() => {
      cy.loginViaAPI(Cypress.env('adminEmail'), Cypress.env('adminPassword'))
      cy.visit('/users')
    })

    it('should display create user button', () => {
      cy.contains('Add User').should('be.visible')
    })

    it('should open create user form', () => {
      cy.contains('Add User').click()
      cy.get('input[name="name"]').should('exist')
      cy.get('input[name="email"]').should('exist')
      cy.get('input[name="password"]').should('exist')
      cy.get('select[name="role"]').should('exist')
    })

    it('should successfully create a new user', () => {
      cy.contains('Add User').click()

      const newUser = {
        name: 'Test Officer',
        email: `test.officer.${Date.now()}@example.com`,
        password: 'password123',
        role: 'officer',
        phone: '1234567890'
      }

      cy.get('input[name="name"]').type(newUser.name)
      cy.get('input[name="email"]').type(newUser.email)
      cy.get('input[name="password"]').type(newUser.password)
      cy.get('select[name="role"]').select(newUser.role)
      cy.get('input[name="phone"]').type(newUser.phone)

      cy.interceptAPI('POST', '/users', 'createUser')
      cy.get('button[type="submit"]').click()

      cy.wait('@createUser')
      cy.checkToast('User created successfully')
      cy.contains(newUser.email).should('be.visible')
    })

    it('should require mandatory fields', () => {
      cy.contains('Add User').click()
      cy.get('button[type="submit"]').click()

      cy.get('input[name="name"]:invalid').should('exist')
      cy.get('input[name="email"]:invalid').should('exist')
    })

    it('should validate email format', () => {
      cy.contains('Add User').click()
      cy.get('input[name="email"]').type('invalid-email')
      cy.get('button[type="submit"]').click()
      cy.get('input[name="email"]:invalid').should('exist')
    })

    it('should create users with different roles', () => {
      const roles = ['officer', 'citizen']

      roles.forEach((role, index) => {
        cy.visit('/users')
        cy.contains('Add User').click()

        cy.get('input[name="name"]').type(`Test ${role}`)
        cy.get('input[name="email"]').type(`test.${role}.${Date.now() + index}@example.com`)
        cy.get('input[name="password"]').type('password123')
        cy.get('select[name="role"]').select(role)

        cy.get('button[type="submit"]').click()
        cy.checkToast('User created successfully')
      })
    })
  })

  describe('Edit User', () => {
    beforeEach(() => {
      cy.loginViaAPI(Cypress.env('adminEmail'), Cypress.env('adminPassword'))
      cy.visit('/users')
    })

    it('should open edit user modal', () => {
      cy.get('tbody tr').first().within(() => {
        cy.contains('Edit').click()
      })

      cy.get('input[name="name"]').should('exist')
      cy.get('input[name="email"]').should('exist')
    })

    it('should successfully update user details', () => {
      cy.get('tbody tr').eq(1).within(() => {
        cy.contains('Edit').click()
      })

      const updatedName = 'Updated Officer Name'
      cy.get('input[name="name"]').clear().type(updatedName)

      cy.interceptAPI('PUT', '/users/*', 'updateUser')
      cy.get('button[type="submit"]').click()

      cy.wait('@updateUser')
      cy.checkToast('User updated successfully')
      cy.contains(updatedName).should('be.visible')
    })

    it('should be able to change user role', () => {
      cy.get('tbody tr').eq(2).within(() => {
        cy.contains('Edit').click()
      })

      cy.get('select[name="role"]').select('officer')

      cy.get('button[type="submit"]').click()
      cy.checkToast('User updated successfully')
    })

    it('should toggle user active status', () => {
      cy.get('tbody tr').eq(1).within(() => {
        cy.contains('Edit').click()
      })

      cy.get('input[type="checkbox"][name="isActive"]').click()

      cy.get('button[type="submit"]').click()
      cy.checkToast('User updated successfully')
    })
  })

  describe('Delete User', () => {
    beforeEach(() => {
      cy.loginViaAPI(Cypress.env('adminEmail'), Cypress.env('adminPassword'))

      // Create a test user to delete
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/users`,
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('token')}`
        },
        body: {
          name: 'User To Delete',
          email: `delete.test.${Date.now()}@example.com`,
          password: 'password123',
          role: 'citizen'
        }
      })

      cy.visit('/users')
    })

    it('should display delete confirmation dialog', () => {
      cy.contains('User To Delete').parent('tr').within(() => {
        cy.contains('Delete').click()
      })

      cy.contains('Are you sure').should('be.visible')
      cy.contains('This action cannot be undone').should('be.visible')
    })

    it('should successfully delete a user', () => {
      cy.contains('User To Delete').parent('tr').within(() => {
        cy.contains('Delete').click()
      })

      cy.interceptAPI('DELETE', '/users/*', 'deleteUser')
      cy.contains('Confirm').click()

      cy.wait('@deleteUser')
      cy.checkToast('User deleted successfully')
      cy.contains('User To Delete').should('not.exist')
    })

    it('should cancel delete operation', () => {
      cy.contains('User To Delete').parent('tr').within(() => {
        cy.contains('Delete').click()
      })

      cy.contains('Cancel').click()
      cy.contains('User To Delete').should('be.visible')
    })
  })

  describe('User Search and Filter', () => {
    beforeEach(() => {
      cy.loginViaAPI(Cypress.env('adminEmail'), Cypress.env('adminPassword'))
      cy.visit('/users')
    })

    it('should search users by name or email', () => {
      cy.get('input[placeholder*="Search"]').should('exist')
      cy.get('input[placeholder*="Search"]').type('admin')
      cy.wait(500)
      cy.get('tbody tr').should('have.length.at.least', 1)
      cy.contains('admin').should('be.visible')
    })

    it('should filter users by role', () => {
      cy.get('select').first().select('admin')
      cy.wait(500)
      cy.get('tbody tr').should('have.length.at.least', 1)
      cy.get('.badge').should('contain.text', 'Admin')
    })

    it('should filter users by status', () => {
      cy.get('select').eq(1).select('active')
      cy.wait(500)
      cy.get('tbody tr').should('have.length.at.least', 1)
    })

    it('should clear all filters', () => {
      cy.get('input[placeholder*="Search"]').type('test')
      cy.get('select').first().select('officer')

      cy.contains('Clear Filters').click()
      cy.get('input[placeholder*="Search"]').should('have.value', '')
      cy.get('select').first().should('have.value', '')
    })
  })

  describe('Access Control', () => {
    it('should not allow officer to access users page', () => {
      cy.loginViaAPI(Cypress.env('officerEmail'), Cypress.env('officerPassword'))
      cy.visit('/users')

      // Should redirect or show error
      cy.url().should('not.include', '/users')
    })

    it('should not allow citizen to access users page', () => {
      cy.loginViaAPI(Cypress.env('citizenEmail'), Cypress.env('citizenPassword'))
      cy.visit('/users')

      // Should redirect or show error
      cy.url().should('not.include', '/users')
    })

    it('should not display users menu item for non-admins', () => {
      cy.loginViaAPI(Cypress.env('citizenEmail'), Cypress.env('citizenPassword'))
      cy.visit('/dashboard')

      cy.contains('Users').should('not.exist')
    })
  })

  describe('User Details View', () => {
    beforeEach(() => {
      cy.loginViaAPI(Cypress.env('adminEmail'), Cypress.env('adminPassword'))
      cy.visit('/users')
    })

    it('should display user details when clicking on a row', () => {
      cy.get('tbody tr').first().click()

      cy.contains('User Details').should('be.visible')
      cy.contains('Email:').should('be.visible')
      cy.contains('Role:').should('be.visible')
      cy.contains('Phone:').should('be.visible')
    })

    it('should display user activity history', () => {
      cy.get('tbody tr').first().click()

      cy.contains('Activity History').should('be.visible')
      cy.contains('Recent Actions').should('be.visible')
    })
  })

  describe('Bulk Operations', () => {
    beforeEach(() => {
      cy.loginViaAPI(Cypress.env('adminEmail'), Cypress.env('adminPassword'))
      cy.visit('/users')
    })

    it('should select multiple users', () => {
      cy.get('input[type="checkbox"]').eq(0).check()
      cy.get('input[type="checkbox"]').eq(1).check()

      cy.contains('selected').should('be.visible')
    })

    it('should deactivate multiple users', () => {
      cy.get('input[type="checkbox"]').eq(1).check()
      cy.get('input[type="checkbox"]').eq(2).check()

      cy.contains('Deactivate Selected').click()
      cy.contains('Confirm').click()

      cy.checkToast('Users deactivated successfully')
    })
  })

  describe('Pagination', () => {
    beforeEach(() => {
      cy.loginViaAPI(Cypress.env('adminEmail'), Cypress.env('adminPassword'))
      cy.visit('/users')
    })

    it('should display pagination controls', () => {
      cy.get('[aria-label="pagination"]').should('exist')
    })

    it('should change page size', () => {
      cy.get('select[name="pageSize"]').select('10')
      cy.wait(500)
      cy.get('tbody tr').should('have.length.at.most', 10)
    })
  })
})
