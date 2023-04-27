import type { Booking, LostBed, NewBooking, Premises, Room } from '@approved-premises/api'
import errorLookups from '../../../../server/i18n/en/errors.json'
import BedspaceConflictErrorComponent from '../../../components/bedspaceConflictError'
import Page from '../../page'

export default abstract class BookingEditablePage extends Page {
  private readonly bedspaceConflictErrorComponent: BedspaceConflictErrorComponent

  constructor(title: string, premises: Premises, room: Room) {
    super(title)

    this.bedspaceConflictErrorComponent = new BedspaceConflictErrorComponent(premises, room, 'booking')
  }

  shouldShowDateConflictErrorMessages(
    conflictingEntity: Booking | LostBed,
    conflictingEntityType: 'booking' | 'lost-bed',
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
    this.getLabel("What is the person's CRN")
    this.getTextInputByIdAndEnterDetails('crn', newOrUpdateBooking.crn)

    this.getLegend('What is the start date?')
    this.completeDateInputs('arrivalDate', newOrUpdateBooking.arrivalDate)

    this.getLegend('What is the end date?')
    this.completeDateInputs('departureDate', newOrUpdateBooking.departureDate)

    this.clickSubmit()
  }
}
