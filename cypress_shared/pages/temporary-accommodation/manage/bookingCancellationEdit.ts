import type { Booking, Cas3Bedspace, NewCancellation, Premises, Room } from '@approved-premises/api'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import BookingInfoComponent from '../../../components/bookingInfo'
import LocationHeaderComponent from '../../../components/locationHeader'
import PopDetailsHeaderComponent from '../../../components/popDetailsHeader'
import BookingCancellationEditablePage from './bookingCancellationEditable'

export default class BookingCancellationEditPage extends BookingCancellationEditablePage {
  private readonly popDetailsHeaderComponent: PopDetailsHeaderComponent

  private readonly locationHeaderComponent: LocationHeaderComponent

  private readonly bookingInfoComponent: BookingInfoComponent

  constructor(
    premises: Premises,
    room: Room,
    bedspace: Cas3Bedspace,
    private readonly booking: Booking,
  ) {
    super('Update cancelled booking')

    this.popDetailsHeaderComponent = new PopDetailsHeaderComponent(booking.person)
    this.locationHeaderComponent = new LocationHeaderComponent({ premises, room, bedspace })
    this.bookingInfoComponent = new BookingInfoComponent(booking)
  }

  static visit(premises: Premises, room: Room, bedspace: Cas3Bedspace, booking: Booking): BookingCancellationEditPage {
    if (room) {
      cy.visit(
        paths.bookings.cancellations.edit({ premisesId: premises.id, bedspaceId: room.id, bookingId: booking.id }),
      )
    } else {
      cy.visit(
        paths.bookings.cancellations.edit({ premisesId: premises.id, bedspaceId: bedspace.id, bookingId: booking.id }),
      )
    }
    return new BookingCancellationEditPage(premises, room, bedspace, booking)
  }

  shouldShowBookingDetails(): void {
    this.popDetailsHeaderComponent.shouldShowPopDetails()
    this.locationHeaderComponent.shouldShowLocationDetails()
    this.bookingInfoComponent.shouldShowBookingDetails()

    this.shouldShowFormContents(this.booking.cancellation)
  }

  completeForm(newCancellation: NewCancellation): void {
    this.clearForm()
    super.completeForm(newCancellation)
  }
}
