import type { Cas3Bedspace, Cas3Premises } from '@approved-premises/api'
import Page from '../../page'

export default class BedspaceArchivePage extends Page {
  constructor(
    private readonly premises: Cas3Premises,
    private readonly bedspace: Cas3Bedspace,
  ) {
    super(`When should ${bedspace.reference} be archived?`)
  }

  static visit(premises: Cas3Premises, bedspace: Cas3Bedspace): BedspaceArchivePage {
    cy.visit(`/temporary-accommodation/manage/properties/${premises.id}/bedspaces/${bedspace.id}/archive`)
    return new BedspaceArchivePage(premises, bedspace)
  }

  shouldShowBedspaceDetails(): void {
    cy.get('h1').should('contain', `When should ${this.bedspace.reference} be archived?`)
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

  completeArchiveWithToday(): void {
    this.selectTodayOption()
    this.clickSubmit()
  }
}
