import type { Booking, NewConfirmation } from '@approved-premises/api'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import BookingInfoComponent from '../../../components/bookingInfo'
import LocationHeaderComponent from '../../../components/locationHeader'
import Page from '../../page'

export default class BookingConfirmationNewPage extends Page {
  private readonly locationHeaderComponent: LocationHeaderComponent

  private readonly bookingInfoComponent: BookingInfoComponent

  constructor(booking: Booking) {
    super('Mark booking as confirmed')

    this.locationHeaderComponent = new LocationHeaderComponent({ crn: booking.person.crn })
    this.bookingInfoComponent = new BookingInfoComponent(booking)
  }

  static visit(premisesId: string, roomId: string, booking: Booking): BookingConfirmationNewPage {
    cy.visit(paths.bookings.confirmations.new({ premisesId, roomId, bookingId: booking.id }))
    return new BookingConfirmationNewPage(booking)
  }

  shouldShowBookingDetails(): void {
    this.locationHeaderComponent.shouldShowLocationDetails()
    this.bookingInfoComponent.shouldShowBookingDetails()
  }

  completeForm(newConfirmation: NewConfirmation): void {
    this.getLabel('Please provide any further details')
    this.getTextInputByIdAndEnterDetails('notes', newConfirmation.notes)

    this.clickSubmit()
  }
}
