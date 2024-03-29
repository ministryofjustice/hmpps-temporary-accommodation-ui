import type { Booking, Premises, Room } from '@approved-premises/api'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import BookingInfoComponent from '../../../components/bookingInfo'
import LocationHeaderComponent from '../../../components/locationHeader'
import PopDetailsHeaderComponent from '../../../components/popDetailsHeader'
import BookingDepartureEditablePage from './bookingDepartureEditable'

export default class BookingDepartureNewPage extends BookingDepartureEditablePage {
  private readonly popDetailsHeaderComponent: PopDetailsHeaderComponent

  private readonly locationHeaderComponent: LocationHeaderComponent

  private readonly bookingInfoComponent: BookingInfoComponent

  constructor(premises: Premises, room: Room, booking: Booking) {
    super('Mark booking as departed')

    this.locationHeaderComponent = new LocationHeaderComponent({ premises, room })
    this.popDetailsHeaderComponent = new PopDetailsHeaderComponent(booking.person)
    this.bookingInfoComponent = new BookingInfoComponent(booking)
  }

  static visit(premises: Premises, room: Room, booking: Booking): BookingDepartureNewPage {
    cy.visit(paths.bookings.departures.new({ premisesId: premises.id, roomId: room.id, bookingId: booking.id }))
    return new BookingDepartureNewPage(premises, room, booking)
  }

  shouldShowBookingDetails(): void {
    this.popDetailsHeaderComponent.shouldShowPopDetails()
    this.locationHeaderComponent.shouldShowLocationDetails()
    this.bookingInfoComponent.shouldShowBookingDetails()
  }
}
