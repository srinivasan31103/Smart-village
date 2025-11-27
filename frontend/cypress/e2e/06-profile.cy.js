describe('User Profile Management', () => {
  describe('Profile Page', () => {
    beforeEach(() => {
      cy.loginViaAPI(Cypress.env('adminEmail'), Cypress.env('adminPassword'))
      cy.visit('/profile')
    })

    it('should display profile page', () => {
      cy.contains('Profile').should('be.visible')
      cy.contains('Manage your account settings').should('be.visible')
    })

    it('should display user information form', () => {
      cy.get('input[name="name"]').should('exist')
      cy.get('input[name="email"]').should('exist')
      cy.get('input[name="phone"]').should('exist')
    })

    it('should pre-fill form with current user data', () => {
      cy.get('input[name="email"]').should('have.value', Cypress.env('adminEmail'))
      cy.get('input[name="name"]').should('not.have.value', '')
    })

    it('should display address fields', () => {
      cy.get('input[name="address.street"]').should('exist')
      cy.get('input[name="address.city"]').should('exist')
      cy.get('input[name="address.state"]').should('exist')
      cy.get('input[name="address.pincode"]').should('exist')
    })

    it('should have disabled email field', () => {
      cy.get('input[name="email"]').should('be.disabled')
    })
  })

  describe('Update Profile Information', () => {
    beforeEach(() => {
      cy.loginViaAPI(Cypress.env('adminEmail'), Cypress.env('adminPassword'))
      cy.visit('/profile')
    })

    it('should successfully update name', () => {
      const newName = 'Updated Admin Name'

      cy.get('input[name="name"]').clear().type(newName)

      cy.interceptAPI('PUT', '/users/me', 'updateProfile')
      cy.get('button[type="submit"]').contains('Save Changes').click()

      cy.wait('@updateProfile')
      cy.checkToast('Profile updated successfully')
      cy.get('input[name="name"]').should('have.value', newName)
    })

    it('should successfully update phone number', () => {
      cy.get('input[name="phone"]').clear().type('9876543210')

      cy.get('button[type="submit"]').contains('Save Changes').click()
      cy.checkToast('Profile updated successfully')
    })

    it('should successfully update address', () => {
      const address = {
        street: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        pincode: '123456'
      }

      cy.get('input[name="address.street"]').clear().type(address.street)
      cy.get('input[name="address.city"]').clear().type(address.city)
      cy.get('input[name="address.state"]').clear().type(address.state)
      cy.get('input[name="address.pincode"]').clear().type(address.pincode)

      cy.get('button[type="submit"]').contains('Save Changes').click()
      cy.checkToast('Profile updated successfully')

      cy.get('input[name="address.street"]').should('have.value', address.street)
    })

    it('should validate required fields', () => {
      cy.get('input[name="name"]').clear()
      cy.get('button[type="submit"]').contains('Save Changes').click()

      cy.get('input[name="name"]:invalid').should('exist')
    })

    it('should validate phone number format', () => {
      cy.get('input[name="phone"]').clear().type('123')
      cy.get('button[type="submit"]').contains('Save Changes').click()

      // Should show validation error
      cy.contains('Invalid phone number').should('exist').or(() => {
        cy.get('input[name="phone"]:invalid').should('exist')
      })
    })
  })

  describe('Change Password', () => {
    beforeEach(() => {
      cy.loginViaAPI(Cypress.env('adminEmail'), Cypress.env('adminPassword'))
      cy.visit('/profile')
    })

    it('should display change password section', () => {
      cy.contains('Change Password').should('be.visible')
      cy.get('input[name="currentPassword"]').should('exist')
      cy.get('input[name="newPassword"]').should('exist')
      cy.get('input[name="confirmPassword"]').should('exist')
    })

    it('should successfully change password', () => {
      cy.get('input[name="currentPassword"]').type(Cypress.env('adminPassword'))
      cy.get('input[name="newPassword"]').type('newPassword123')
      cy.get('input[name="confirmPassword"]').type('newPassword123')

      cy.interceptAPI('PUT', '/users/me/password', 'changePassword')
      cy.get('button').contains('Change Password').click()

      cy.wait('@changePassword')
      cy.checkToast('Password changed successfully')

      // Change back to original password
      cy.get('input[name="currentPassword"]').clear().type('newPassword123')
      cy.get('input[name="newPassword"]').clear().type(Cypress.env('adminPassword'))
      cy.get('input[name="confirmPassword"]').clear().type(Cypress.env('adminPassword'))
      cy.get('button').contains('Change Password').click()
      cy.checkToast('Password changed successfully')
    })

    it('should require all password fields', () => {
      cy.get('button').contains('Change Password').click()

      cy.get('input[name="currentPassword"]:invalid').should('exist')
      cy.get('input[name="newPassword"]:invalid').should('exist')
      cy.get('input[name="confirmPassword"]:invalid').should('exist')
    })

    it('should validate password confirmation match', () => {
      cy.get('input[name="currentPassword"]').type(Cypress.env('adminPassword'))
      cy.get('input[name="newPassword"]').type('newPassword123')
      cy.get('input[name="confirmPassword"]').type('differentPassword')

      cy.get('button').contains('Change Password').click()

      cy.contains('Passwords do not match').should('be.visible')
    })

    it('should validate minimum password length', () => {
      cy.get('input[name="currentPassword"]').type(Cypress.env('adminPassword'))
      cy.get('input[name="newPassword"]').type('123')
      cy.get('input[name="confirmPassword"]').type('123')

      cy.get('button').contains('Change Password').click()

      cy.contains('Password must be at least').should('exist').or(() => {
        cy.get('input[name="newPassword"]:invalid').should('exist')
      })
    })

    it('should reject incorrect current password', () => {
      cy.get('input[name="currentPassword"]').type('wrongpassword')
      cy.get('input[name="newPassword"]').type('newPassword123')
      cy.get('input[name="confirmPassword"]').type('newPassword123')

      cy.interceptAPI('PUT', '/users/me/password', 'changePassword')
      cy.get('button').contains('Change Password').click()

      cy.wait('@changePassword')
      cy.checkToast('Current password is incorrect')
    })
  })

  describe('Profile for Different Roles', () => {
    it('should display officer profile correctly', () => {
      cy.loginViaAPI(Cypress.env('officerEmail'), Cypress.env('officerPassword'))
      cy.visit('/profile')

      cy.contains('Profile').should('be.visible')
      cy.get('input[name="name"]').should('exist')
      cy.get('input[name="email"]').should('have.value', Cypress.env('officerEmail'))
    })

    it('should display citizen profile correctly', () => {
      cy.loginViaAPI(Cypress.env('citizenEmail'), Cypress.env('citizenPassword'))
      cy.visit('/profile')

      cy.contains('Profile').should('be.visible')
      cy.get('input[name="name"]').should('exist')
      cy.get('input[name="email"]').should('have.value', Cypress.env('citizenEmail'))
    })

    it('should allow officer to update their profile', () => {
      cy.loginViaAPI(Cypress.env('officerEmail'), Cypress.env('officerPassword'))
      cy.visit('/profile')

      cy.get('input[name="phone"]').clear().type('9876543210')
      cy.get('button[type="submit"]').contains('Save Changes').click()

      cy.checkToast('Profile updated successfully')
    })

    it('should allow citizen to update their profile', () => {
      cy.loginViaAPI(Cypress.env('citizenEmail'), Cypress.env('citizenPassword'))
      cy.visit('/profile')

      cy.get('input[name="phone"]').clear().type('9876543210')
      cy.get('button[type="submit"]').contains('Save Changes').click()

      cy.checkToast('Profile updated successfully')
    })
  })

  describe('Profile Navigation', () => {
    beforeEach(() => {
      cy.loginViaAPI(Cypress.env('adminEmail'), Cypress.env('adminPassword'))
      cy.visit('/dashboard')
    })

    it('should navigate to profile from navbar dropdown', () => {
      cy.get('[data-testid="user-menu"]').click()
      cy.contains('Profile').click()

      cy.url().should('include', '/profile')
    })

    it('should navigate to profile from sidebar', () => {
      cy.contains('Profile').click()
      cy.url().should('include', '/profile')
    })

    it('should navigate back to dashboard', () => {
      cy.visit('/profile')
      cy.contains('Back to Dashboard').click()

      cy.url().should('include', '/dashboard')
    })
  })

  describe('Profile Display Information', () => {
    beforeEach(() => {
      cy.loginViaAPI(Cypress.env('adminEmail'), Cypress.env('adminPassword'))
      cy.visit('/profile')
    })

    it('should display user role badge', () => {
      cy.get('.badge').should('contain.text', 'Admin')
    })

    it('should display account creation date', () => {
      cy.contains('Member since').should('be.visible')
      cy.contains(/\d{4}/).should('be.visible') // Year
    })

    it('should display profile sections', () => {
      cy.contains('Personal Information').should('be.visible')
      cy.contains('Contact Information').should('be.visible')
      cy.contains('Address').should('be.visible')
      cy.contains('Security').should('be.visible')
    })
  })

  describe('Profile Avatar', () => {
    beforeEach(() => {
      cy.loginViaAPI(Cypress.env('adminEmail'), Cypress.env('adminPassword'))
      cy.visit('/profile')
    })

    it('should display user avatar or initials', () => {
      cy.get('[data-testid="user-avatar"]').should('exist').or(() => {
        cy.get('.avatar').should('exist')
      })
    })

    it('should have upload avatar button', () => {
      cy.contains('Change Avatar').should('exist').or(() => {
        cy.get('input[type="file"][accept*="image"]').should('exist')
      })
    })
  })

  describe('Form Validation', () => {
    beforeEach(() => {
      cy.loginViaAPI(Cypress.env('adminEmail'), Cypress.env('adminPassword'))
      cy.visit('/profile')
    })

    it('should prevent submission with invalid data', () => {
      cy.get('input[name="name"]').clear()
      cy.get('input[name="phone"]').clear().type('abc')

      cy.get('button[type="submit"]').contains('Save Changes').click()

      cy.get('input:invalid').should('exist')
    })

    it('should show field-specific error messages', () => {
      cy.get('input[name="name"]').clear().blur()
      cy.contains('Name is required').should('be.visible').or(() => {
        cy.get('input[name="name"]:invalid').should('exist')
      })
    })

    it('should validate pincode format', () => {
      cy.get('input[name="address.pincode"]').clear().type('abc')
      cy.get('button[type="submit"]').contains('Save Changes').click()

      cy.contains('Invalid pincode').should('exist').or(() => {
        cy.get('input[name="address.pincode"]:invalid').should('exist')
      })
    })
  })

  describe('Responsive Design', () => {
    beforeEach(() => {
      cy.loginViaAPI(Cypress.env('adminEmail'), Cypress.env('adminPassword'))
    })

    it('should display correctly on mobile', () => {
      cy.viewport('iphone-x')
      cy.visit('/profile')

      cy.contains('Profile').should('be.visible')
      cy.get('input[name="name"]').should('be.visible')
    })

    it('should display correctly on tablet', () => {
      cy.viewport('ipad-2')
      cy.visit('/profile')

      cy.contains('Profile').should('be.visible')
      cy.get('input[name="name"]').should('be.visible')
    })

    it('should display correctly on desktop', () => {
      cy.viewport(1920, 1080)
      cy.visit('/profile')

      cy.contains('Profile').should('be.visible')
      cy.get('input[name="name"]').should('be.visible')
    })
  })

  describe('Profile Updates Persistence', () => {
    beforeEach(() => {
      cy.loginViaAPI(Cypress.env('adminEmail'), Cypress.env('adminPassword'))
    })

    it('should persist profile changes after page refresh', () => {
      const testPhone = '1112223333'

      cy.visit('/profile')
      cy.get('input[name="phone"]').clear().type(testPhone)
      cy.get('button[type="submit"]').contains('Save Changes').click()
      cy.checkToast('Profile updated successfully')

      cy.reload()
      cy.get('input[name="phone"]').should('have.value', testPhone)
    })

    it('should reflect profile changes in navbar', () => {
      const newName = 'Test Updated Name'

      cy.visit('/profile')
      cy.get('input[name="name"]').clear().type(newName)
      cy.get('button[type="submit"]').contains('Save Changes').click()
      cy.checkToast('Profile updated successfully')

      cy.visit('/dashboard')
      cy.get('[data-testid="user-menu"]').should('contain', newName)
    })
  })

  describe('Cancel Changes', () => {
    beforeEach(() => {
      cy.loginViaAPI(Cypress.env('adminEmail'), Cypress.env('adminPassword'))
      cy.visit('/profile')
    })

    it('should reset form when cancel is clicked', () => {
      const originalName = cy.get('input[name="name"]').invoke('val')

      cy.get('input[name="name"]').clear().type('Temporary Name')
      cy.contains('Cancel').click()

      cy.get('input[name="name"]').should('have.value', originalName)
    })

    it('should show unsaved changes warning', () => {
      cy.get('input[name="name"]').clear().type('Temporary Name')
      cy.contains('Dashboard').click()

      cy.contains('unsaved changes').should('be.visible').or(() => {
        cy.on('window:confirm', () => true)
      })
    })
  })
})
