import config from '../config'
import paths from '../paths/temporary-accommodation/manage'
import premisesFactory from '../testutils/factories/premises'
import roomFactory from '../testutils/factories/room'
import { bedspaceActions } from './bedspaceUtils'

describe('bedspaceUtils', () => {
  describe('bedspaceUtils', () => {
    it('returns book bedspace and void bedspace for an active premises when voids are enabled', () => {
      config.flags.voidsDisabled = false

      const premises = premisesFactory.build({
        status: 'active',
      })
      const room = roomFactory.build()

      expect(bedspaceActions(premises, room)).toEqual([
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

    it('returns book bedspace and void bedspace for an active premises when voids are disabled', () => {
      config.flags.voidsDisabled = true

      const premises = premisesFactory.build({
        status: 'active',
      })
      const room = roomFactory.build()

      expect(bedspaceActions(premises, room)).toEqual([
        {
          text: 'Book bedspace',
          classes: 'govuk-button--secondary',
          href: paths.bookings.new({ premisesId: premises.id, roomId: room.id }),
        },
      ])
    })

    it('returns null for an archived premises', () => {
      const premises = premisesFactory.build({
        status: 'archived',
      })
      const room = roomFactory.build()

      expect(bedspaceActions(premises, room)).toEqual(null)
    })
  })
})
