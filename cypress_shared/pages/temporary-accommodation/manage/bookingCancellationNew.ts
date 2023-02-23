import type { Booking, NewCancellation } from '@approved-premises/api'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import BookingInfoComponent from '../../../components/bookingInfo'
import LocationHeaderComponent from '../../../components/locationHeader'
import Page from '../../page'

export default class BookingCancellationNewPage extends Page {
  private readonly locationHeaderComponent: LocationHeaderComponent

  private readonly bookingInfoComponent: BookingInfoComponent

  constructor(private readonly booking: Booking) {
    super('Cancel booking')

    this.bookingInfoComponent = new BookingInfoComponent(booking)
    this.locationHeaderComponent = new LocationHeaderComponent({ crn: booking.person.crn })
  }

  static visit(premisesId: string, roomId: string, booking: Booking): BookingCancellationNewPage {
    cy.visit(paths.bookings.cancellations.new({ premisesId, roomId, bookingId: booking.id }))
    return new BookingCancellationNewPage(booking)
  }

  shouldShowBookingDetails(): void {
    this.locationHeaderComponent.shouldShowLocationDetails()
    this.bookingInfoComponent.shouldShowBookingDetails()

    this.shouldShowDateInputs('date', this.booking.departureDate)
  }

  completeForm(newCancellation: NewCancellation): void {
    this.clearForm()

    this.getLegend('When was this booking cancelled?')
    this.completeDateInputs('date', newCancellation.date)

    this.getLabel('What was the reason for cancellation?')
    this.getSelectInputByIdAndSelectAnEntry('reason', newCancellation.reason)

    this.getLabel('Please provide any further details')
    this.getTextInputByIdAndEnterDetails('notes', newCancellation.notes)

    this.clickSubmit()
  }

  clearForm(): void {
    this.clearDateInputs('date')
  }
}
