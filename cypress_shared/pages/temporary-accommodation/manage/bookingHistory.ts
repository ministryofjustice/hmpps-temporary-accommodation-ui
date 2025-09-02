import type { Booking, Cas3Bedspace, Premises, Room } from '@approved-premises/api'

import paths from '../../../../server/paths/temporary-accommodation/manage'
import BookingInfoComponent from '../../../components/bookingInfo'
import LocationHeaderComponent from '../../../components/locationHeader'
import PopDetailsHeaderComponent from '../../../components/popDetailsHeader'
import Page from '../../page'

export default class BookingHistoryPage extends Page {
  private readonly popDetailsHeaderComponent: PopDetailsHeaderComponent

  private readonly locationHeaderComponent: LocationHeaderComponent

  private readonly bookingInfoComponents: BookingInfoComponent[]

  constructor(premises: Premises, room: Room, bedspace: Cas3Bedspace, booking: Booking, historicBookings: Booking[]) {
    super('Booking history')

    this.popDetailsHeaderComponent = new PopDetailsHeaderComponent(booking.person)
    this.locationHeaderComponent = new LocationHeaderComponent({ premises, room, bedspace })
    this.bookingInfoComponents = historicBookings.map(historicBooking => new BookingInfoComponent(historicBooking))
  }

  static visit(
    premises: Premises,
    room: Room,
    bedspace: Cas3Bedspace,
    booking: Booking,
    bookings: Booking[],
  ): BookingHistoryPage {
    if (room) {
      cy.visit(paths.bookings.history({ premisesId: premises.id, bedspaceId: room.id, bookingId: booking.id }))
    } else {
      cy.visit(paths.bookings.history({ premisesId: premises.id, bedspaceId: bedspace.id, bookingId: booking.id }))
    }
    return new BookingHistoryPage(premises, room, bedspace, booking, bookings)
  }

  shouldShowBookingHistory(): void {
    this.popDetailsHeaderComponent.shouldShowPopDetails()
    this.locationHeaderComponent.shouldShowLocationDetails()

    this.bookingInfoComponents.forEach((bookingInfoComponent, index) => {
      cy.get(`[data-cy-history-index="${index}"]`).within(() => {
        bookingInfoComponent.shouldShowBookingDetails()
      })
    })
  }
}
