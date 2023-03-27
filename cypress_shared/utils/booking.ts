import { Booking, Premises, Room } from '../../server/@types/shared'
import premisesFactory from '../../server/testutils/factories/premises'
import roomFactory from '../../server/testutils/factories/room'

export const setupBookingStateStubs = (booking: Booking): { premises: Premises; room: Room } => {
  const premises = premisesFactory.build()
  const room = roomFactory.build()

  cy.task('stubSinglePremises', premises)
  cy.task('stubSingleRoom', { premisesId: premises.id, room })
  cy.task('stubBooking', { premisesId: premises.id, booking })

  return { premises, room }
}
