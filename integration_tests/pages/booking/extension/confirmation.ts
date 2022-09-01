import parseISO from 'date-fns/parseISO'
import type { Booking } from 'approved-premises'
import { formatDate } from '../../../../server/utils/utils'
import Page from '../../page'
import paths from '../../../../server/paths/manage'

export default class BookingExtensionConfirmationPage extends Page {
  constructor() {
    super('Booking extension complete')
  }

  static visit(premisesId: string, bookingId: string): BookingExtensionConfirmationPage {
    cy.visit(paths.bookings.extensions.confirm({ premisesId, bookingId }))
    return new BookingExtensionConfirmationPage()
  }

  verifyBookingIsVisible(booking: Booking): void {
    cy.get('dl').within(() => {
      this.assertDefinition('Name', booking.name)
      this.assertDefinition('CRN', booking.crn)
      this.assertDefinition('Expected arrival date', formatDate(parseISO(booking.expectedArrivalDate)))
      this.assertDefinition('New expected departure date', formatDate(parseISO(booking.expectedDepartureDate)))
      this.assertDefinition('Key worker', booking.keyWorker.name)
    })
  }
}
