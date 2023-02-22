import type { NewBooking } from '@approved-premises/api'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import BookingEditablePage from './bookingEditable'

export default class BookingNewPage extends BookingEditablePage {
  constructor() {
    super('Book bedspace')
  }

  static visit(premisesId: string, roomId: string): BookingNewPage {
    cy.visit(paths.bookings.new({ premisesId, roomId }))
    return new BookingNewPage()
  }

  completeForm(newBooking: NewBooking): void {
    super.completeEditableForm(newBooking)
  }

  shouldShowPrefilledBookingDetails(newBooking: NewBooking): void {
    this.shouldShowDateInputs('arrivalDate', newBooking.arrivalDate)
    this.shouldShowDateInputs('departureDate', newBooking.departureDate)

    cy.get('#crn').should('have.value', newBooking.crn)
  }
}
