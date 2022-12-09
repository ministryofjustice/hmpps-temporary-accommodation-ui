import type { Booking, NewConfirmation } from '@approved-premises/api'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import BookingInfoComponent from '../../../components/bookingInfo'
import Page from '../../page'

export default class BookingConfirmationNewPage extends Page {
  private readonly bookingInfoComponent: BookingInfoComponent

  constructor(private readonly booking: Booking) {
    super('Mark booking as confirmed')

    this.bookingInfoComponent = new BookingInfoComponent(booking)
  }

  static visit(premisesId: string, roomId: string, booking: Booking): BookingConfirmationNewPage {
    cy.visit(paths.bookings.confirmations.new({ premisesId, roomId, bookingId: booking.id }))
    return new BookingConfirmationNewPage(booking)
  }

  shouldShowBookingDetails(): void {
    cy.get('.location-header').within(() => {
      cy.get('p').should('contain', this.booking.person.crn)
    })

    this.bookingInfoComponent.shouldShowBookingDetails()
  }

  completeForm(newConfirmation: NewConfirmation): void {
    this.getLabel('Please provide any further details')
    this.getTextInputByIdAndEnterDetails('notes', newConfirmation.notes)

    this.clickSubmit()
  }
}
