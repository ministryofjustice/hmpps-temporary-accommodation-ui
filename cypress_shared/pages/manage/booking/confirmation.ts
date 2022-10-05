import type { Booking } from 'approved-premises'

import Page from '../../page'
import paths from '../../../../server/paths/manage'
import { DateFormats } from '../../../../server/utils/dateUtils'

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
      this.assertDefinition('Name', booking.person.name)
      this.assertDefinition('CRN', booking.person.crn)
      this.assertDefinition('Expected arrival date', DateFormats.isoDateToUIDate(booking.arrivalDate))
      this.assertDefinition('Expected departure date', DateFormats.isoDateToUIDate(booking.departureDate))
    })
  }

  shouldShowOvercapacityMessage(
    firstOvercapacityPeriod: OvercapacityPeriod,
    secondOvercapacityPeriod: OvercapacityPeriod,
  ) {
    this.shouldShowBanner(`The premises is over capacity for the periods:`)
    cy.get('.govuk-list > :nth-child(1)').contains(
      `${DateFormats.isoDateToUIDate(firstOvercapacityPeriod.start)} to ${DateFormats.isoDateToUIDate(
        firstOvercapacityPeriod.end,
      )}`,
    )
    cy.get('.govuk-list > :nth-child(2)').contains(
      `${DateFormats.isoDateToUIDate(secondOvercapacityPeriod.start)} to ${DateFormats.isoDateToUIDate(
        secondOvercapacityPeriod.end,
      )}`,
    )
  }
}
