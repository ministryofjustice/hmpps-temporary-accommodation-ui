import type { Booking } from '@approved-premises/api'
import { getLatestExtension, shortenedOrExtended } from '../../server/utils/bookingUtils'
import { DateFormats } from '../../server/utils/dateUtils'
import Component from './component'

export default class BookingInfoComponent extends Component {
  constructor(private readonly booking: Booking) {
    super()
  }

  shouldShowBookingDetails(): void {
    cy.wrap(this.booking).as('modifiedBooking')

    if (Cypress.env('testLevel') === 'e2e' && this.booking.status === 'departed') {
      cy.get('.govuk-summary-list__key')
        .contains('Status')
        .siblings('.govuk-summary-list__value')
        .then(statusElement => {
          if (statusElement.text().trim() === 'Departed') {
            cy.wrap({ ...this.booking, status: 'closed' }).as('modifiedBooking')
          }
        })
    }

    const { shouldShowKeyAndValue, shouldShowKeyAndValues } = this

    cy.then(function _() {
      const { status } = this.modifiedBooking

      if (status === 'provisional' || status === 'confirmed' || status === 'cancelled') {
        shouldShowKeyAndValue('Start date', DateFormats.isoDateToUIDate(this.modifiedBooking.arrivalDate))
        shouldShowKeyAndValue('End date', DateFormats.isoDateToUIDate(this.modifiedBooking.departureDate))
      } else if (status === 'arrived') {
        shouldShowKeyAndValue('Arrival date', DateFormats.isoDateToUIDate(this.modifiedBooking.arrivalDate))
        shouldShowKeyAndValue(
          'Expected departure date',
          DateFormats.isoDateToUIDate(this.modifiedBooking.departureDate),
        )
      } else if (status === 'departed') {
        shouldShowKeyAndValue('Departure date', DateFormats.isoDateToUIDate(this.modifiedBooking.departureDate))
      }

      if (status === 'provisional') {
        shouldShowKeyAndValue('Status', 'Provisional')
      } else if (status === 'confirmed') {
        shouldShowKeyAndValue('Status', 'Confirmed')
        shouldShowKeyAndValues('Notes', this.modifiedBooking.confirmation.notes.split('\n'))
      } else if (status === 'cancelled') {
        shouldShowKeyAndValue('Status', 'Cancelled')
        shouldShowKeyAndValue('Cancellation date', DateFormats.isoDateToUIDate(this.modifiedBooking.cancellation.date))
        shouldShowKeyAndValue('Cancellation reason', this.modifiedBooking.cancellation.reason.name)
        shouldShowKeyAndValues('Notes', this.modifiedBooking.cancellation.notes.split('\n'))
      } else if (status === 'arrived') {
        shouldShowKeyAndValue('Status', 'Active')
        shouldShowKeyAndValues('Notes', this.modifiedBooking.arrival.notes.split('\n'))

        const latestExtension = getLatestExtension(this.modifiedBooking)
        if (latestExtension) {
          const keyText =
            shortenedOrExtended(latestExtension) === 'shortened'
              ? 'Notes on shortened booking'
              : 'Notes on extended booking'
          shouldShowKeyAndValues(keyText, latestExtension.notes.split('\n'))
        }
      } else if (status === 'departed' || status === 'closed') {
        shouldShowKeyAndValue('Status', status === 'departed' ? 'Departed - Turnaround In Progress' : 'Departed')
        shouldShowKeyAndValue('Departure reason', this.modifiedBooking.departure.reason.name)
        shouldShowKeyAndValue('Move on category', this.modifiedBooking.departure.moveOnCategory.name)
        shouldShowKeyAndValues('Notes', this.modifiedBooking.departure.notes.split('\n'))
      }
    })
  }
}
