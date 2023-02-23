import type { Booking, Premises, Room } from '@approved-premises/api'

import paths from '../../../../server/paths/temporary-accommodation/manage'
import LocationHeaderComponent from '../../../components/locationHeader'
import Page from '../../page'

export default class BookingConfirmPage extends Page {
  private readonly locationHeaderComponent: LocationHeaderComponent

  constructor(premises: Premises, room: Room, booking?: Booking) {
    super('Confirm CRN')

    this.locationHeaderComponent = new LocationHeaderComponent({ premises, room, crn: booking?.person.crn })
  }

  static visit(premises: Premises, room: Room, booking: Booking): BookingConfirmPage {
    cy.visit(paths.bookings.confirm({ premisesId: premises.id, roomId: room.id }))
    return new BookingConfirmPage(premises, room, booking)
  }

  shouldShowBookingDetails(): void {
    this.locationHeaderComponent.shouldShowLocationDetails()
  }
}
