import type { Booking, Cas3Bedspace, Cas3Premises, LostBed, NewBooking } from '@approved-premises/api'
import errorLookups from '../../../../server/i18n/en/errors.json'
import BedspaceConflictErrorComponent from '../../../components/bedspaceConflictError'
import Page from '../../page'

export default abstract class BookingEditablePage extends Page {
  private readonly bedspaceConflictErrorComponent: BedspaceConflictErrorComponent

  constructor(title: string, premises: Cas3Premises, bedspace: Cas3Bedspace) {
    super(title)

    this.bedspaceConflictErrorComponent = new BedspaceConflictErrorComponent(premises, bedspace, 'booking')
  }

  shouldShowDateConflictErrorMessages(
    conflictingEntity: Booking | LostBed | null,
    conflictingEntityType: 'booking' | 'lost-bed' | 'bedspace-end-date',
  ): void {
    this.bedspaceConflictErrorComponent.shouldShowDateConflictErrorMessages(
      ['arrivalDate', 'departureDate'],
      conflictingEntity,
      conflictingEntityType,
    )
  }

  shouldShowUserPermissionErrorMessage(): void {
    cy.get('.govuk-error-summary').should('contain', errorLookups.generic.crn.userPermission)
    cy.get(`[data-cy-error-crn]`).should('contain', errorLookups.generic.crn.userPermission)
  }

  shouldShowEndDateHint(date: string): void {
    cy.get('#departureDate-hint').should('contain', `The end date for a booking of 84 days is ${date}`)
  }

  protected completeEditableForm(newOrUpdateBooking: NewBooking): void {
    this.completeTextInputByLabel("What is the person's CRN", newOrUpdateBooking.crn)
    this.completeDateInputsByLegend('What is the start date?', newOrUpdateBooking.arrivalDate)
    this.completeDateInputsByLegend('What is the end date?', newOrUpdateBooking.departureDate)

    this.clickSubmit()
  }
}
