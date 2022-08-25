import parseISO from 'date-fns/parseISO'
import type { Booking } from 'approved-premises'
import { formatDate } from '../../../server/utils/utils'
import Page from '../page'

export default class BookingConfirmationPage extends Page {
  constructor() {
    super('Booking complete')
  }

  static visit(premisesId: string, bookingId: string): BookingConfirmationPage {
    cy.visit(`/premises/${premisesId}/bookings/${bookingId}/confirmation`)
    return new BookingConfirmationPage()
  }

  verifyBookingIsVisible(booking: Booking): void {
    cy.get('dl').within(() => {
      this.assertDefinition('Name', booking.name)
      this.assertDefinition('CRN', booking.crn)
      this.assertDefinition('Expected arrival date', formatDate(parseISO(booking.expectedArrivalDate)))
      this.assertDefinition('Expected departure date', formatDate(parseISO(booking.expectedDepartureDate)))
      this.assertDefinition('Key worker', booking.keyWorker.name)
    })
  }
}
