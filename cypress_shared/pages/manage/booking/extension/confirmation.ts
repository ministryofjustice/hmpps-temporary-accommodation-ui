import type { Booking } from '@approved-premises/api'

import Page from '../../../page'
import paths from '../../../../../server/paths/manage'
import { DateFormats } from '../../../../../server/utils/dateUtils'

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
      this.assertDefinition('Name', booking.person.name)
      this.assertDefinition('CRN', booking.person.crn)
      this.assertDefinition('Expected arrival date', DateFormats.isoDateToUIDate(booking.arrivalDate))
      this.assertDefinition('New expected departure date', DateFormats.isoDateToUIDate(booking.departureDate))
    })
  }

  verifyNewExpectedDepartureDate(date: string): void {
    cy.get('dl').within(() => {
      this.assertDefinition('New expected departure date', DateFormats.isoDateToUIDate(date))
    })
  }
}
