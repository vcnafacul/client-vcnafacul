describe('Credentials', () => {
  it('should be able to create an account', () => {
    // cy.visit('http://localhost:5173')
  })

  it('should not be able to create a duplicated account', () => {
    // cy.visit('http://localhost:5173')
  })

  it('should be able to login', () => {
    cy.visit('http://localhost:5173')
    cy.viewport(1280, 720) // laptop screen

    cy.contains('Aceitar').click(); // cookie bar

    // Open login screen
    cy.contains('Login').click();

    // Fill login form
    cy.get('input[name="email"]').type('johndoe@example.com');
    cy.get('input[name="password"]').type('Pass123#*');

    // Submit the form
    cy.get('button[type="submit"]').click();

    // Assert that the form submission was successful
    cy.contains('Bem Vindos ao Você na Facul').should('exist');
  })

  it('should not be able to login with wrong password', () => {
    // cy.visit('http://localhost:5173')
  })

  it('should not be able to login with unknown email', () => {
    // cy.visit('http://localhost:5173')
  })

  it('should not be able to forgot password and change it', () => {
    // cy.visit('http://localhost:5173')
  })
})
