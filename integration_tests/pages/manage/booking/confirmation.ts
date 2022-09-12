import parseISO from 'date-fns/parseISO'

import type { Booking } from 'approved-premises'

import Page from '../../page'
import { formatDate, formatDateString } from '../../../../server/utils/utils'
import paths from '../../../../server/paths/manage'

type OvercapacityPeriod = {
  start: string
  end: string
}
export default class BookingConfirmationPage extends Page {
  constructor() {
    super('Booking complete')
  }

  static visit(premisesId: string, bookingId: string): BookingConfirmationPage {
    cy.visit(paths.bookings.confirm({ premisesId, bookingId }))

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

  shouldShowOvercapacityMessage(
    firstOvercapacityPeriod: OvercapacityPeriod,
    secondOvercapacityPeriod: OvercapacityPeriod,
  ) {
    this.shouldShowBanner(`The premises is over capacity for the periods:`)
    cy.get('.govuk-list > :nth-child(1)').contains(
      `${formatDateString(firstOvercapacityPeriod.start)} to ${formatDateString(firstOvercapacityPeriod.end)}`,
    )
    cy.get('.govuk-list > :nth-child(2)').contains(
      `${formatDateString(secondOvercapacityPeriod.start)} to ${formatDateString(secondOvercapacityPeriod.end)}`,
    )
  }
}
