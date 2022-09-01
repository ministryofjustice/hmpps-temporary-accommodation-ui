import type { Booking } from 'approved-premises'

import Page from '../page'
import { formatDateString } from '../../../server/utils/utils'
import paths from '../../../server/paths'

export default class BookingShowPage extends Page {
  constructor() {
    super('Booking details')
  }

  static visit(premisesId: string, booking: Booking): BookingShowPage {
    cy.visit(paths.bookings.show({ premisesId, bookingId: booking.id }))
    return new BookingShowPage()
  }

  shouldShowBookingDetails(booking: Booking): void {
    cy.get('dl[data-cy-expected-dates]').within(() => {
      this.assertDefinition('Arrival date', formatDateString(booking.expectedArrivalDate))
      this.assertDefinition('Departure date', formatDateString(booking.expectedDepartureDate))
      this.assertDefinition('Key worker', booking.keyWorker.name)
    })

    cy.get('dl[data-cy-arrival-information]').within(() => {
      this.assertDefinition('Arrival date', formatDateString(booking.arrival.date))
      this.assertDefinition('Departure date', formatDateString(booking.arrival.expectedDepartureDate))
      this.assertDefinition('Notes', booking.arrival.notes)
    })

    cy.get('dl[data-cy-departure-information]').within(() => {
      this.assertDefinition('Actual departure date', formatDateString(booking.departure.dateTime))
      this.assertDefinition('Reason', booking.departure.reason.name)
      this.assertDefinition('Notes', booking.departure.notes)
    })
  }
}
