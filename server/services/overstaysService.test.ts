import { CallConfig } from '../data/restClient'
import { BookingClient } from '../data'
import OverstaysService from './overstaysService'
import { cas3NewOverstayFactory, cas3OverstayFactory } from '../testutils/factories'

jest.mock('../data/bookingClient.ts')

describe('OverstaysService', () => {
  const callConfig = { token: 'some-token' } as CallConfig

  const premisesId = 'a934562a-71ee-445c-9c60-f873aa6018a9'
  const bookingId = '3b7971af-6a8f-4ec3-adf0-a7fde58ca79d'

  const bookingClient = new BookingClient(null) as jest.Mocked<BookingClient>
  const bookingClientFactory = jest.fn()

  const service = new OverstaysService(bookingClientFactory)

  beforeEach(() => {
    jest.resetAllMocks()
    bookingClientFactory.mockReturnValue(bookingClient)
  })

  describe('createOverstay', () => {
    it('on success returns the overstay that has been created', async () => {
      const newOverstay = cas3NewOverstayFactory.build()
      const overstay = cas3OverstayFactory.build({
        bookingId,
        ...newOverstay,
      })

      bookingClient.overstayBooking.mockResolvedValue(overstay)

      const result = await service.createOverstay(callConfig, premisesId, bookingId, newOverstay)
      expect(result).toEqual(overstay)

      expect(bookingClientFactory).toHaveBeenCalledWith(callConfig)
      expect(bookingClient.overstayBooking).toHaveBeenCalledWith(premisesId, bookingId, newOverstay)
    })
  })
})
