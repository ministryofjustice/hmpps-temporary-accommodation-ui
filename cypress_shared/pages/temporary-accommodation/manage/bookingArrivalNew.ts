import type { Booking, NewArrival } from '@approved-premises/api'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import Page from '../../page'
import errorLookups from '../../../../server/i18n/en/errors.json'
import BookingInfoComponent from '../../../components/bookingInfo'

export default class BookingArrivalNewPage extends Page {
  private readonly bookingInfoComponent: BookingInfoComponent

  constructor(private readonly booking: Booking) {
    super('Mark booking as active')

    this.bookingInfoComponent = new BookingInfoComponent(booking)
  }

  static visit(premisesId: string, roomId: string, booking: Booking): BookingArrivalNewPage {
    cy.visit(paths.bookings.arrivals.new({ premisesId, roomId, bookingId: booking.id }))
    return new BookingArrivalNewPage(booking)
  }

  shouldShowBookingDetails(): void {
    cy.get('.location-header').within(() => {
      cy.get('p').should('contain', this.booking.person.crn)
    })

    this.bookingInfoComponent.shouldShowBookingDetails()

    this.shouldShowDateInputs('arrivalDate', this.booking.arrivalDate)
    this.shouldShowDateInputs('expectedDepartureDate', this.booking.departureDate)
  }

  shouldShowDateConflictErrorMessages(): void {
    ;['arrivalDate', 'expectedDepartureDate'].forEach(field => {
      cy.get('.govuk-error-summary').should('contain', errorLookups.generic[field].conflict)
      cy.get(`[data-cy-error-${field}]`).should('contain', errorLookups.generic[field].conflict)
    })
  }

  completeForm(newArrival: NewArrival): void {
    this.clearForm()

    this.getLegend('What was the arrival date?')
    this.completeDateInputs('arrivalDate', newArrival.arrivalDate)

    this.getLegend('What is the expected departure date?')
    this.completeDateInputs('expectedDepartureDate', newArrival.expectedDepartureDate)

    this.getLabel('Please provide any further details')
    this.getTextInputByIdAndEnterDetails('notes', newArrival.notes)

    this.clickSubmit()
  }

  clearForm(): void {
    this.clearDateInputs('arrivalDate')
    this.clearDateInputs('expectedDepartureDate')
  }
}
