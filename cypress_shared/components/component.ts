export type PageElement = Cypress.Chainable<JQuery>

export default abstract class Component {
  shouldShowKeyAndValue(key: string, value: string): void {
    cy.get('.govuk-summary-list__key').contains(key).siblings('.govuk-summary-list__value').should('contain', value)
  }

  shouldShowKeyAndValues(key: string, values: string[]): void {
    cy.get('.govuk-summary-list__key')
      .contains(key)
      .siblings('.govuk-summary-list__value')
      .within(elements => {
        values.forEach(value => {
          cy.wrap(elements).should('contain', value)
        })
      })
  }
}
