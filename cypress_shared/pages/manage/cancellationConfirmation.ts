import type { Cancellation, Booking } from 'approved-premises'
import { DateFormats } from '../../../server/utils/dateUtils'
import Page from '../page'

export default class CancellationConfirmPage extends Page {
  constructor() {
    super('Cancellation complete')
  }

  verifyConfirmedCancellationIsVisible(cancellation: Cancellation, booking: Booking): void {
    cy.get('dl').within(() => {
      this.assertDefinition('Name', booking.person.name)
      this.assertDefinition('CRN', booking.person.crn)
      this.assertDefinition('Arrival date', DateFormats.isoDateToUIDate(booking.arrivalDate))
      this.assertDefinition('Expected departure date', DateFormats.isoDateToUIDate(booking.departureDate))
      this.assertDefinition('Date of cancellation', DateFormats.isoDateToUIDate(cancellation.date))
      this.assertDefinition('Notes', cancellation.notes)
    })
  }
}
