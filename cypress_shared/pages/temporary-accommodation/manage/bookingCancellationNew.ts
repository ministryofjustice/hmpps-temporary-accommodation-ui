import type { Booking, NewCancellation, Premises, Room } from '@approved-premises/api'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import BookingInfoComponent from '../../../components/bookingInfo'
import LocationHeaderComponent from '../../../components/locationHeader'
import PopDetailsHeaderComponent from '../../../components/popDetailsHeader'
import Page from '../../page'

export default class BookingCancellationNewPage extends Page {
  private readonly locationHeaderComponent: LocationHeaderComponent

  private readonly popDetailsHeaderComponent: PopDetailsHeaderComponent

  private readonly bookingInfoComponent: BookingInfoComponent

  constructor(premises: Premises, room: Room, private readonly booking: Booking) {
    super('Cancel booking')

    this.bookingInfoComponent = new BookingInfoComponent(booking)
    this.popDetailsHeaderComponent = new PopDetailsHeaderComponent(booking.person)
    this.locationHeaderComponent = new LocationHeaderComponent({ premises, room })
  }

  static visit(premises: Premises, room: Room, booking: Booking): BookingCancellationNewPage {
    cy.visit(paths.bookings.cancellations.new({ premisesId: premises.id, roomId: room.id, bookingId: booking.id }))
    return new BookingCancellationNewPage(premises, room, booking)
  }

  shouldShowBookingDetails(): void {
    this.popDetailsHeaderComponent.shouldShowPopDetails()
    this.locationHeaderComponent.shouldShowLocationDetails()
    this.bookingInfoComponent.shouldShowBookingDetails()
  }

  completeForm(newCancellation: NewCancellation): void {
    this.getLegend('When was this booking cancelled?')
    this.completeDateInputs('date', newCancellation.date)

    this.getLabel('What was the reason for cancellation?')
    this.getSelectInputByIdAndSelectAnEntry('reason', newCancellation.reason)

    this.getLabel('Please provide any further details')
    this.getTextInputByIdAndEnterDetails('notes', newCancellation.notes)

    this.clickSubmit()
  }
}
