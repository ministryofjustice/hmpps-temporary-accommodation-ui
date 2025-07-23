import type { Cas3Bedspace, Cas3Premises } from '@approved-premises/api'
import Page from '../../../page'

export default class BedspaceArchivePage extends Page {
  constructor(
    private readonly premises: Cas3Premises,
    private readonly bedspace: Cas3Bedspace,
  ) {
    super(`When should ${bedspace.reference} be archived?`)
  }

  static visit(premises: Cas3Premises, bedspace: Cas3Bedspace): BedspaceArchivePage {
    cy.visit(`/temporary-accommodation/manage/v2/properties/${premises.id}/bedspaces/${bedspace.id}/archive`)
    return new BedspaceArchivePage(premises, bedspace)
  }

  shouldShowBedspaceDetails(): void {
    cy.get('h1').should('contain', `When should ${this.bedspace.reference} be archived?`)
  }

  selectTodayOption(): void {
    cy.get('input[value="today"]').check()
  }

  selectAnotherDateOption(): void {
    cy.get('input[value="anotherDate"]').check()
  }

  enterArchiveDate(day: string, month: string, year: string): void {
    cy.get('#archiveDate-day').clear().type(day)
    cy.get('#archiveDate-month').clear().type(month)
    cy.get('#archiveDate-year').clear().type(year)
  }

  clickSubmit(): void {
    cy.get('button[type="submit"]').click()
  }

  shouldShowError(errorMessage: string): void {
    cy.get('.govuk-error-summary').should('contain', errorMessage)
  }

  shouldShowValidationErrors(): void {
    cy.get('.govuk-error-summary').should('exist')
  }

  completeArchiveWithToday(): void {
    this.selectTodayOption()
    this.clickSubmit()
  }

  completeArchiveWithDate(day: string, month: string, year: string): void {
    this.selectAnotherDateOption()
    this.enterArchiveDate(day, month, year)
    this.clickSubmit()
  }
}
