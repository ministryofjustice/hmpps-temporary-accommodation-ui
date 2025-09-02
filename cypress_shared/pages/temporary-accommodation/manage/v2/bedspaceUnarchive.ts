import type { Cas3Bedspace, Cas3Premises } from '@approved-premises/api'
import Page from '../../../page'

export default class BedspaceUnarchivePage extends Page {
  constructor(
    private readonly premises: Cas3Premises,
    private readonly bedspace: Cas3Bedspace,
  ) {
    super(`When should ${bedspace.reference} go online?`)
  }

  static visit(premises: Cas3Premises, bedspace: Cas3Bedspace): BedspaceUnarchivePage {
    cy.visit(`/temporary-accommodation/manage/v2/properties/${premises.id}/bedspaces/${bedspace.id}/unarchive`)
    return new BedspaceUnarchivePage(premises, bedspace)
  }

  shouldShowBedspaceDetails(): void {
    cy.get('h1').should('contain', `When should ${this.bedspace.reference} go online?`)
  }

  selectTodayOption(): void {
    cy.get('input[value="today"]').check()
  }

  selectAnotherDateOption(): void {
    cy.get('input[value="other"]').check()
  }

  enterArchiveDate(day: string, month: string, year: string): void {
    cy.get('#otherDateInput-day').clear().type(day)
    cy.get('#otherDateInput-month').clear().type(month)
    cy.get('#otherDateInput-year').clear().type(year)
  }

  clickSubmit(): void {
    cy.get('button[type="submit"]').click()
  }

  shouldShowError(errorMessage: string): void {
    cy.get('.govuk-error-summary').should('contain', errorMessage)
  }

  completeUnarchiveWithToday(): void {
    this.selectTodayOption()
    this.clickSubmit()
  }
}
