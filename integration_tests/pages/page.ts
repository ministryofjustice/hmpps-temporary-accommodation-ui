import errorLookups from '../../server/i18n/en/errors.json'

export type PageElement = Cypress.Chainable<JQuery>

export default abstract class Page {
  static verifyOnPage<T>(constructor: new (...args: unknown[]) => T, ...args: unknown[]): T {
    return new constructor(...args)
  }

  constructor(private readonly title: string) {
    this.checkOnPage()
  }

  assertDefinition(term: string, value: string): void {
    cy.get('dt').should('contain', term)
    cy.get('dd').should('contain', value)
  }

  checkOnPage(): void {
    cy.get('h1').contains(this.title)
  }

  signOut = (): PageElement => cy.get('[data-qa=signOut]')

  manageDetails = (): PageElement => cy.get('[data-qa=manageDetails]')

  shouldShowErrorMessagesForFields(fields: Array<string>): void {
    fields.forEach(field => {
      cy.get('.govuk-error-summary').should('contain', errorLookups[field]?.blank)
      cy.get(`[data-cy-error-${field}]`).should('contain', errorLookups[field]?.blank)
    })
  }
}
