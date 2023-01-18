context('Cookies', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  it('should navigate to the cookie policy page', () => {
    cy.signIn()
    cy.contains('Cookies').click()
    cy.title().should('eq', 'Cookies')
    cy.contains('Cookies are small files saved on your phone, tablet or computer when you visit a website.')
  })
})
