import parseISO from 'date-fns/parseISO'
import type { Cancellation, Booking } from 'approved-premises'
import { formatDate } from '../../../server/utils/utils'
import Page from '../page'

export default class CancellationConfirmPage extends Page {
  constructor() {
    super('Cancellation complete')
  }

  verifyConfirmedCancellationIsVisible(cancellation: Cancellation, booking: Booking): void {
    cy.get('dl').within(() => {
      this.assertDefinition('Name', booking.person.name)
      this.assertDefinition('CRN', booking.person.crn)
      this.assertDefinition('Arrival date', formatDate(parseISO(booking.arrivalDate)))
      this.assertDefinition('Expected departure date', formatDate(parseISO(booking.departureDate)))
      this.assertDefinition('Date of cancellation', formatDate(parseISO(cancellation.date)))
      this.assertDefinition('Notes', cancellation.notes)
    })
  }
}
