import { addDays } from 'date-fns'
import paths from '../paths/temporary-accommodation/manage'
import { bedFactory, placeContextFactory, premisesFactory, roomFactory } from '../testutils/factories'
import { bedspaceActions, bedspaceStatus } from './bedspaceUtils'
import { addPlaceContext } from './placeUtils'
import { DateFormats } from './dateUtils'

jest.mock('./placeUtils')

describe('bedspaceUtils', () => {
  describe('bedspaceActions', () => {
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

    it('returns null for an archived bedspace in an active premises', () => {
      const placeContext = placeContextFactory.build()

      const premises = premisesFactory.build({
        status: 'active',
      })
      const room = roomFactory.build({
        beds: [
          bedFactory.build({
            bedEndDate: DateFormats.dateObjToIsoDate(addDays(new Date(), -14)),
          }),
        ],
      })

      expect(bedspaceActions(premises, room, placeContext)).toEqual(null)
    })
  })

  describe('bedspaceStatus', () => {
    it('returns online if the bedspace has no end date', () => {
      const room = roomFactory.build()
      const status = bedspaceStatus(room)

      expect(status).toEqual('online')
    })

    it('returns online if the bedspace has an end date in the future', () => {
      const room = roomFactory.build({
        beds: [
          bedFactory.build({
            bedEndDate: DateFormats.dateObjToIsoDate(addDays(new Date(), 7)),
          }),
        ],
      })
      const status = bedspaceStatus(room)

      expect(status).toEqual('online')
    })

    it('returns archived if the bedspace has an end date in the past', () => {
      const room = roomFactory.build({
        beds: [
          bedFactory.build({
            bedEndDate: DateFormats.dateObjToIsoDate(addDays(new Date(), -7)),
          }),
        ],
      })
      const status = bedspaceStatus(room)

      expect(status).toEqual('archived')
    })

    it('returns archived if the bedspace has today as an end date', () => {
      const room = roomFactory.build({
        beds: [
          bedFactory.build({
            bedEndDate: DateFormats.dateObjToIsoDate(new Date()),
          }),
        ],
      })
      const status = bedspaceStatus(room)

      expect(status).toEqual('archived')
    })
  })
})
