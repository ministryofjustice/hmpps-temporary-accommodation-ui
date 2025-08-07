import Page from '../../../page'
import { Cas3Premises } from '../../../../../server/@types/shared'

export default class PremisesArchivePage extends Page {
  constructor(premises: Cas3Premises) {
    super(`When should ${premises.addressLine1} be archived?`)
  }

  enterDate(date: string): void {
    cy.get('label').contains('Another date').click()
    this.completeDateInputsByLegend('Enter a date within the last 7 days or the next 3 months', date)
  }

  shouldShowGivenErrorMessagesForField(field: string, error: string): void {
    cy.get('.govuk-error-summary').contains(error).should('have.attr', 'href', `#${field}`)
  }
}
