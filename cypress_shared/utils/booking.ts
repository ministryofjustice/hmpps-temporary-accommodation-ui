import { Booking, BookingStatus, Premises, Room } from '../../server/@types/shared'
import { premisesFactory, roomFactory } from '../../server/testutils/factories'
import { statusName } from '../../server/utils/bookingUtils'

export const setupBookingStateStubs = (booking: Booking): { premises: Premises; room: Room } => {
  const premises = premisesFactory.build()
  const room = roomFactory.build()

  cy.task('stubSinglePremises', premises)
  cy.task('stubSingleRoom', { premisesId: premises.id, room })
  cy.task('stubBooking', { premisesId: premises.id, booking })

  return { premises, room }
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
