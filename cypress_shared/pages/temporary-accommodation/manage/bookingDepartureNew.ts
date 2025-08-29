import type { Booking, Cas3Bedspace, Premises, Room } from '@approved-premises/api'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import BookingInfoComponent from '../../../components/bookingInfo'
import LocationHeaderComponent from '../../../components/locationHeader'
import PopDetailsHeaderComponent from '../../../components/popDetailsHeader'
import BookingDepartureEditablePage from './bookingDepartureEditable'

export default class BookingDepartureNewPage extends BookingDepartureEditablePage {
  private readonly popDetailsHeaderComponent: PopDetailsHeaderComponent

  private readonly locationHeaderComponent: LocationHeaderComponent

  private readonly bookingInfoComponent: BookingInfoComponent

  constructor(premises: Premises, room: Room, bedspace: Cas3Bedspace, booking: Booking) {
    super('Mark booking as departed')

    this.locationHeaderComponent = new LocationHeaderComponent({ premises, room, bedspace })
    this.popDetailsHeaderComponent = new PopDetailsHeaderComponent(booking.person)
    this.bookingInfoComponent = new BookingInfoComponent(booking)
  }

  static visit(premises: Premises, room: Room, bedspace: Cas3Bedspace, booking: Booking): BookingDepartureNewPage {
    if (room) {
      cy.visit(paths.bookings.departures.new({ premisesId: premises.id, bedspaceId: room.id, bookingId: booking.id }))
    } else {
      cy.visit(
        paths.bookings.departures.new({ premisesId: premises.id, bedspaceId: bedspace.id, bookingId: booking.id }),
      )
    }
    return new BookingDepartureNewPage(premises, room, bedspace, booking)
  }

  shouldShowBookingDetails(): void {
    this.popDetailsHeaderComponent.shouldShowPopDetails()
    this.locationHeaderComponent.shouldShowLocationDetails()
    this.bookingInfoComponent.shouldShowBookingDetails()
  }
}
