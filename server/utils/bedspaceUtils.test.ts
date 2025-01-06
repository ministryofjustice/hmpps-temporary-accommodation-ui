import { addDays } from 'date-fns'
import paths from '../paths/temporary-accommodation/manage'
import { bedFactory, placeContextFactory, premisesFactory, roomFactory } from '../testutils/factories'
import { bedspaceActions, bedspaceStatus, insertEndDateErrors } from './bedspaceUtils'
import { addPlaceContext } from './placeUtils'
import { DateFormats } from './dateUtils'
import * as validation from './validation'

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
          classes: 'govuk-button--secondary moj-button-menu__item',
          href: '/path/with/place/context',
        },
        {
          text: 'Void bedspace',
          classes: 'govuk-button--secondary moj-button-menu__item',
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

  describe('insertEndDateErrors', () => {
    beforeEach(() => {
      jest.spyOn(validation, 'insertBespokeError')
      jest.spyOn(validation, 'insertGenericError')
    })

    it('inserts an error for a date before created at conflict', () => {
      const error = {
        status: 400,
        data: {
          detail: 'Bedspace end date cannot be prior to the Bedspace creation date: 2024-04-14',
        },
        stack: '',
        message: '',
      }

      insertEndDateErrors(error, 'premiseId', 'roomId')

      expect(validation.insertBespokeError).toHaveBeenCalledWith(error, {
        errorTitle: 'There is a problem',
        errorSummary: [
          {
            text: 'The bedspace end date must be on or after the date the bedspace was created (14 April 2024)',
          },
        ],
      })
      expect(validation.insertGenericError).toHaveBeenCalledWith(error, 'bedEndDate', 'beforeCreatedAt')
    })

    it('inserts an error for an existing booking conflict', () => {
      const error = {
        status: 409,
        data: {
          detail: 'Conflict booking exists for the room with end date 2024-05-27: bookingId',
        },
        stack: '',
        message: '',
      }

      insertEndDateErrors(error, 'premiseId', 'roomId')

      expect(validation.insertBespokeError).toHaveBeenCalledWith(error, {
        errorTitle: 'There is a problem',
        errorSummary: [
          {
            html: `This bedspace end date conflicts with <a href="${paths.bookings.show({
              premisesId: 'premiseId',
              roomId: 'roomId',
              bookingId: 'bookingId',
            })}">an existing booking</a>`,
          },
        ],
      })
      expect(validation.insertGenericError).toHaveBeenCalledWith(error, 'bedEndDate', 'conflict')
    })
  })
})
