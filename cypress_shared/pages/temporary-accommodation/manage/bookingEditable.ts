import type { NewBooking } from '@approved-premises/api'
import Page from '../../page'
import errorLookups from '../../../../server/i18n/en/errors.json'

export default abstract class BookingEditablePage extends Page {
  shouldShowDateConflictErrorMessages(): void {
    ;['arrivalDate', 'departureDate'].forEach(field => {
      cy.get('.govuk-error-summary').should('contain', errorLookups[field].conflict)
      cy.get(`[data-cy-error-${field}]`).should('contain', errorLookups[field].conflict)
    })
  }

  protected completeEditableForm(newOrUpdateBooking: NewBooking): void {
    this.getLabel("What is the person's CRN")
    this.getTextInputByIdAndEnterDetails('crn', newOrUpdateBooking.crn)

    this.getLegend('What is the start date?')
    this.completeDateInputs('arrivalDate', newOrUpdateBooking.arrivalDate)

    this.getLegend('What is the end date?')
    this.completeDateInputs('departureDate', newOrUpdateBooking.departureDate)

    this.clickSubmit()
  }
}
