import paths from '../paths/temporary-accommodation/manage'
import { placeContextFactory, premisesFactory, roomFactory } from '../testutils/factories'
import { bedspaceActions } from './bedspaceUtils'
import { addPlaceContext } from './placeUtils'

jest.mock('./placeUtils')

describe('bedspaceUtils', () => {
  describe('bedspaceUtils', () => {
    it('returns book bedspace and void bedspace for an active premises', () => {
      const premises = premisesFactory.build({
        status: 'active',
      })
      const room = roomFactory.build()
      const placeContext = placeContextFactory.build()

      ;(addPlaceContext as jest.MockedFunction<typeof addPlaceContext>).mockReturnValue('/path/with/place/context')

      expect(bedspaceActions(premises, room, placeContext)).toEqual([
        {
          text: 'Book bedspace',
          classes: 'govuk-button--secondary',
          href: '/path/with/place/context',
        },
        {
          text: 'Void bedspace',
          classes: 'govuk-button--secondary',
          href: paths.lostBeds.new({ premisesId: premises.id, roomId: room.id }),
        },
      ])

      expect(addPlaceContext).toHaveBeenCalledWith(
        paths.bookings.new({ premisesId: premises.id, roomId: room.id }),
        placeContext,
      )
    })

    it('returns null for an archived premises', () => {
      const placeContext = placeContextFactory.build()

      const premises = premisesFactory.build({
        status: 'archived',
      })
      const room = roomFactory.build()

      expect(bedspaceActions(premises, room, placeContext)).toEqual(null)
    })
  })
})
