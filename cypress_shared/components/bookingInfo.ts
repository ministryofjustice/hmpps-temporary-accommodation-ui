import type { Booking } from '@approved-premises/api'
import { BookingStatus } from '../../server/@types/ui/index'
import { getLatestExtension, shortenedOrExtended, statusName } from '../../server/utils/bookingUtils'
import { DateFormats } from '../../server/utils/dateUtils'
import Component from './component'

export default class BookingInfoComponent extends Component {
  constructor(private readonly booking: Booking) {
    super()
  }

  shouldShowBookingDetails(): void {
    cy.wrap(this.booking).as('modifiedBooking')

    if (this.booking.status === ('unknown-departed-or-closed' as BookingStatus)) {
      cy.get('.govuk-summary-list__key')
        .contains('Status')
        .siblings('.govuk-summary-list__value')
        .then(statusElement => {
          const status = statusElement.text().trim() === statusName('closed') ? 'closed' : 'departed'
          cy.wrap({ ...this.booking, status }).as('modifiedBooking')
        })
    }

    const { shouldShowKeyAndValue, shouldShowKeyAndValues } = this

    cy.then(function _() {
      const { status } = this.modifiedBooking

      shouldShowKeyAndValue('Status', statusName(this.modifiedBooking.status))

      if (status === 'provisional' || status === 'confirmed' || status === 'cancelled') {
        shouldShowKeyAndValue('Start date', DateFormats.isoDateToUIDate(this.modifiedBooking.arrivalDate))
        shouldShowKeyAndValue('End date', DateFormats.isoDateToUIDate(this.modifiedBooking.departureDate))
      } else if (status === 'arrived') {
        shouldShowKeyAndValue('Arrival date', DateFormats.isoDateToUIDate(this.modifiedBooking.arrivalDate))
        shouldShowKeyAndValue(
          'Expected departure date',
          DateFormats.isoDateToUIDate(this.modifiedBooking.departureDate),
        )
      } else if (status === 'departed' || status === 'closed') {
        shouldShowKeyAndValue('Departure date', DateFormats.isoDateToUIDate(this.modifiedBooking.departureDate))
      }

      if (status === 'confirmed') {
        shouldShowKeyAndValues('Notes', this.modifiedBooking.confirmation.notes.split('\n'))
      } else if (status === 'cancelled') {
        shouldShowKeyAndValue('Cancellation date', DateFormats.isoDateToUIDate(this.modifiedBooking.cancellation.date))
        shouldShowKeyAndValue('Cancellation reason', this.modifiedBooking.cancellation.reason.name)
        shouldShowKeyAndValues('Notes', this.modifiedBooking.cancellation.notes.split('\n'))
      } else if (status === 'arrived') {
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
        shouldShowKeyAndValue('Departure reason', this.modifiedBooking.departure.reason.name)
        shouldShowKeyAndValue('Move on category', this.modifiedBooking.departure.moveOnCategory.name)
        shouldShowKeyAndValues('Notes', this.modifiedBooking.departure.notes.split('\n'))
      }
    })
  }
}
