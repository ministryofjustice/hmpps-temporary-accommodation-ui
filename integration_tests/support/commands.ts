Cypress.Commands.add('signIn', (options = { failOnStatusCode: true }) => {
  cy.clearCookies()
  cy.request('/')

  return cy.task('getSignInUrl').then((url: string) => {
    return cy
      .request({
        url,
        ...options,
      })
      .then(() => {
        if (options.failOnStatusCode) {
          return cy.getCookie('connect.sid').should('exist')
        }
      })
  })
})
