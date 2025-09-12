import Page from '../../../page'
import { Cas3Premises } from '../../../../../server/@types/shared'
import { DateFormats } from '../../../../../server/utils/dateUtils'

export default class PremisesCancelArchivePage extends Page {
  constructor(premises: Cas3Premises) {
    super(`Are you sure you want to cancel the scheduled archive on ${DateFormats.isoDateToUIDate(premises.endDate)}`)
  }

  selectYes(): void {
    cy.get('input[value="yes"]').click()
  }

  selectNo(): void {
    cy.get('input[value="no"]').click()
  }

  shouldShowGivenErrorMessagesForField(field: string, error: string): void {
    cy.get('.govuk-error-summary').contains(error).should('have.attr', 'href', `#${field}`)
  }
}
