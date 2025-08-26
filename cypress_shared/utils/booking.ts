import { Booking, BookingStatus, Cas3Bedspace, Premises } from '../../server/@types/shared'
import { cas3BedspaceFactory, premisesFactory } from '../../server/testutils/factories'
import { statusName } from '../../server/utils/bookingUtils'

export const setupBookingStateStubs = (booking: Booking): { premises: Premises; bedspace: Cas3Bedspace } => {
  const premises = premisesFactory.build()
  const bedspace = cas3BedspaceFactory.build({ status: 'online' })

  cy.task('stubSinglePremises', premises)
  cy.task('stubBedspaceV2', { premisesId: premises.id, bedspace })
  cy.task('stubBooking', { premisesId: premises.id, booking })

  return { premises, bedspace }
}

export const assignModifiedBookingForTurnarounds = (
  booking: Booking,
  statusElement: JQuery<HTMLElement>,
  alias: string,
) => {
  if (booking.status === ('unknown-departed-or-closed' as BookingStatus)) {
    const status = statusElement.text().trim() === statusName('closed') ? 'closed' : 'departed'
    cy.wrap({ ...booking, status }).as(alias)
  } else {
    cy.wrap(booking).as(alias)
  }
}
