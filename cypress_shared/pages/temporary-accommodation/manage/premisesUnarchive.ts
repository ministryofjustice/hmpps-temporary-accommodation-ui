import Page from '../../page'
import { Cas3Premises } from '../../../../server/@types/shared'

export default class PremisesUnarchivePage extends Page {
  constructor(premises: Cas3Premises) {
    super(`When should ${premises.addressLine1} go online?`)
  }

  selectToday(): void {
    cy.get('label').contains('Today').click()
  }

  enterDate(date: string): void {
    cy.get('label').contains('Another date').click()
    this.completeDateInputsByLegend('Enter a date within the last 14 days or the next 14 days', date)
  }

  shouldShowGivenErrorMessageForField(field: string, error: string): void {
    cy.get('.govuk-error-summary').contains(error).should('have.attr', 'href', `#${field}`)
  }
}
