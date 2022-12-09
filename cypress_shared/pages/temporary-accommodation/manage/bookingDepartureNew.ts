import type { Booking, NewDeparture } from '@approved-premises/api'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import BookingInfoComponent from '../../../components/bookingInfo'
import Page from '../../page'

export default class BookingDepartureNewPage extends Page {
  private readonly bookingInfoComponent: BookingInfoComponent

  constructor(private readonly booking: Booking) {
    super('Mark booking as closed')

    this.bookingInfoComponent = new BookingInfoComponent(booking)
  }

  static visit(premisesId: string, roomId: string, booking: Booking): BookingDepartureNewPage {
    cy.visit(paths.bookings.departures.new({ premisesId, roomId, bookingId: booking.id }))
    return new BookingDepartureNewPage(booking)
  }

  shouldShowBookingDetails(): void {
    cy.get('.location-header').within(() => {
      cy.get('p').should('contain', this.booking.person.crn)
    })

    this.bookingInfoComponent.shouldShowBookingDetails()

    this.shouldShowDateInputs('dateTime', this.booking.departureDate)
  }

  completeForm(newDeparture: NewDeparture): void {
    this.clearForm()

    this.getLegend('What was the departure date?')
    this.completeDateInputs('dateTime', newDeparture.dateTime)

    this.getLabel('What was the departure reason?')
    this.getSelectInputByIdAndSelectAnEntry('reasonId', newDeparture.reasonId)

    this.getLabel('What was the move on category?')
    this.getSelectInputByIdAndSelectAnEntry('moveOnCategoryId', newDeparture.moveOnCategoryId)

    this.getLabel('Please provide any further details')
    this.getTextInputByIdAndEnterDetails('notes', newDeparture.notes)

    this.clickSubmit()
  }

  clearForm(): void {
    this.clearDateInputs('dateTime')
  }
}
