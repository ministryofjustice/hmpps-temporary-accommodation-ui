import type { NewBooking } from '@approved-premises/api'
import { Premises, Room } from '../../../../server/@types/shared'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import LocationHeaderComponent from '../../../components/locationHeader'
import BookingEditablePage from './bookingEditable'

export default class BookingNewPage extends BookingEditablePage {
  private readonly locationHeaderComponent: LocationHeaderComponent

  constructor(premises: Premises, room: Room) {
    super('Book bedspace')

    this.locationHeaderComponent = new LocationHeaderComponent({ premises, room })
  }

  static visit(premises: Premises, room: Room): BookingNewPage {
    cy.visit(paths.bookings.new({ premisesId: premises.id, roomId: room.id }))
    return new BookingNewPage(premises, room)
  }

  completeForm(newBooking: NewBooking): void {
    super.completeEditableForm(newBooking)
  }

  shouldShowBookingDetails(): void {
    this.locationHeaderComponent.shouldShowLocationDetails()
  }

  shouldShowPrefilledBookingDetails(newBooking: NewBooking): void {
    this.shouldShowDateInputs('arrivalDate', newBooking.arrivalDate)
    this.shouldShowDateInputs('departureDate', newBooking.departureDate)

    cy.get('#crn').should('have.value', newBooking.crn)
  }
}
