import type { Booking, NewExtension } from '@approved-premises/api'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import Page from '../../page'
import errorLookups from '../../../../server/i18n/en/errors.json'
import BookingInfoComponent from '../../../components/bookingInfo'

export default class BookingExtensionNewPage extends Page {
  private readonly bookingInfoComponent: BookingInfoComponent

  constructor(private readonly booking: Booking) {
    super('Extend or shorten booking')

    this.bookingInfoComponent = new BookingInfoComponent(booking)
  }

  static visit(premisesId: string, roomId: string, booking: Booking): BookingExtensionNewPage {
    cy.visit(paths.bookings.extensions.new({ premisesId, roomId, bookingId: booking.id }))
    return new BookingExtensionNewPage(booking)
  }

  shouldShowBookingDetails(): void {
    cy.get('.location-header').within(() => {
      cy.get('p').should('contain', this.booking.person.crn)
    })

    this.bookingInfoComponent.shouldShowBookingDetails()

    this.shouldShowDateInputs('newDepartureDate', this.booking.departureDate)
  }

  shouldShowDateConflictErrorMessages(): void {
    ;['newDepartureDate'].forEach(field => {
      cy.get('.govuk-error-summary').should('contain', errorLookups.generic[field].conflict)
      cy.get(`[data-cy-error-${field}]`).should('contain', errorLookups.generic[field].conflict)
    })
  }

  completeForm(newExtension: NewExtension): void {
    this.clearForm()

    this.getLegend('What is the new departure date?')
    this.completeDateInputs('newDepartureDate', newExtension.newDepartureDate)

    this.getLabel('Please provide any further details')
    this.getTextInputByIdAndEnterDetails('notes', newExtension.notes)

    this.clickSubmit()
  }

  clearForm(): void {
    this.clearDateInputs('newDepartureDate')
  }
}
