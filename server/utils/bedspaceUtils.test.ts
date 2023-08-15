import paths from '../paths/temporary-accommodation/manage'
import { premisesFactory, roomFactory } from '../testutils/factories'
import { bedspaceActions } from './bedspaceUtils'

describe('bedspaceUtils', () => {
  describe('bedspaceUtils', () => {
    it('returns book bedspace and void bedspace for an active premises', () => {
      const premises = premisesFactory.build({
        status: 'active',
      })
      const room = roomFactory.build()

      expect(bedspaceActions(premises, room, undefined)).toEqual([
        {
          text: 'Book bedspace',
          classes: 'govuk-button--secondary',
          href: paths.bookings.new({ premisesId: premises.id, roomId: room.id }),
        },
        {
          text: 'Void bedspace',
          classes: 'govuk-button--secondary',
          href: paths.lostBeds.new({ premisesId: premises.id, roomId: room.id }),
        },
      ])
    })

    it('returns null for an archived premises', () => {
      const premises = premisesFactory.build({
        status: 'archived',
      })
      const room = roomFactory.build()

      expect(bedspaceActions(premises, room, undefined)).toEqual(null)
    })
  })
})
