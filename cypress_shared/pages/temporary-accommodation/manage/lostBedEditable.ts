import { NewTemporaryAccommodationLostBed as NewLostBed } from '@approved-premises/api'
import Page from '../../page'
import errorLookups from '../../../../server/i18n/en/errors.json'

export default abstract class LostBedEditablePage extends Page {
  shouldShowDateConflictErrorMessages(): void {
    ;['startDate', 'endDate'].forEach(field => {
      cy.get('.govuk-error-summary').should('contain', errorLookups.generic[field].conflict)
      cy.get(`[data-cy-error-${field}]`).should('contain', errorLookups.generic[field].conflict)
    })
  }

  protected completeEditableForm(newOrUpdateLostBed: NewLostBed): void {
    this.getLegend('What is the start date?')
    this.completeDateInputs('startDate', newOrUpdateLostBed.startDate)

    this.getLegend('What is the expected end date?')
    this.completeDateInputs('endDate', newOrUpdateLostBed.endDate)

    this.getLabel('What is the reason for this void?')
    this.getSelectInputByIdAndSelectAnEntry('reason', newOrUpdateLostBed.reason)

    this.getLabel('Please provide further details')
    this.getTextInputByIdAndEnterDetails('notes', newOrUpdateLostBed.notes)

    this.clickSubmit()
  }
}
