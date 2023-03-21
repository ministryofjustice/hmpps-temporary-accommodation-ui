import type { Person, Premises, Room } from '@approved-premises/api'

import paths from '../../../../server/paths/temporary-accommodation/manage'
import LocationHeaderComponent from '../../../components/locationHeader'
import PopDetailsHeaderComponent from '../../../components/popDetailsHeader'
import Page from '../../page'

export default class BookingConfirmPage extends Page {
  private readonly popDetailsHeaderComponent: PopDetailsHeaderComponent

  private readonly locationHeaderComponent: LocationHeaderComponent

  constructor(premises: Premises, room: Room, person: Person) {
    super('Confirm CRN')

    this.popDetailsHeaderComponent = new PopDetailsHeaderComponent(person)

    this.locationHeaderComponent = new LocationHeaderComponent({ premises, room })
  }

  static visit(premises: Premises, room: Room, person: Person): BookingConfirmPage {
    cy.visit(paths.bookings.confirm({ premisesId: premises.id, roomId: room.id }))
    return new BookingConfirmPage(premises, room, person)
  }

  shouldShowBookingDetails(): void {
    this.popDetailsHeaderComponent.shouldShowPopDetails()
    this.locationHeaderComponent.shouldShowLocationDetails()
  }
}
