import type { Booking } from '@approved-premises/api'
import { statusName } from '../../server/utils/bookingUtils'
import { DateFormats } from '../../server/utils/dateUtils'
import { assignModifiedBookingForTurnarounds } from '../utils/booking'
import Component from './component'

export default class BookingListingComponent extends Component {
  constructor(private readonly booking: Booking) {
    super()
  }

  clickLink(): void {
    this.within(() => {
      cy.get('a').click()
    })
  }

  shouldShowBookingDetails(): void {
    this.within(() => {
      cy.get('.listing-entry__content__booking-status .govuk-summary-list__value').then(statusElement =>
        assignModifiedBookingForTurnarounds(this.booking, statusElement, 'modifiedBooking'),
      )

      const { shouldShowKeyAndValue } = this

      cy.then(function _() {
        const booking = this.modifiedBooking as Booking
        const { status, arrivalDate, departureDate } = booking

        if (booking.status === 'arrived' || booking.status === 'departed') {
          cy.get('h2').should('contain', 'Active booking')
        } else {
          cy.get('h2').should('contain', 'Booking')
        }

        cy.get('h3').should('contain', booking.person.name)

        cy.get('.listing-entry__content__booking-person').within(() => {
          shouldShowKeyAndValue('Date of birth', DateFormats.isoDateToUIDate(booking.person.dateOfBirth))
          shouldShowKeyAndValue('CRN', booking.person.crn)
        })

        cy.get('.listing-entry__content__booking-status').within(() => {
          shouldShowKeyAndValue('Status', statusName(status))
        })

        cy.get('.listing-entry__content__booking-placement').within(() => {
          if (status === 'provisional' || status === 'confirmed' || status === 'cancelled') {
            shouldShowKeyAndValue('Start date', DateFormats.isoDateToUIDate(arrivalDate))
            shouldShowKeyAndValue('End date', DateFormats.isoDateToUIDate(departureDate))
          } else if (status === 'arrived') {
            shouldShowKeyAndValue('Arrival date', DateFormats.isoDateToUIDate(arrivalDate))
            shouldShowKeyAndValue('Expected departure date', DateFormats.isoDateToUIDate(departureDate))
          } else if (status === 'departed' || status === 'closed') {
            shouldShowKeyAndValue('Arrival date', DateFormats.isoDateToUIDate(arrivalDate))
            shouldShowKeyAndValue('Departure date', DateFormats.isoDateToUIDate(departureDate))
          }
        })

        if (status !== 'cancelled' && booking.turnaround && booking.turnaround.workingDays) {
          cy.get('.listing-entry__content__booking-turnaround').within(() => {
            if (booking.turnaroundStartDate !== 'unknown') {
              shouldShowKeyAndValue('Start date', DateFormats.isoDateToUIDate(booking.turnaroundStartDate))
            }
            if (booking.effectiveEndDate !== 'unknown') {
              shouldShowKeyAndValue('End date', DateFormats.isoDateToUIDate(booking.effectiveEndDate))
            }
          })
        }
      })
    })
  }

  private within(next: () => void) {
    cy.get('.booking-listing').contains(this.booking.person.crn).parents('.booking-listing').within(next)
  }
}
