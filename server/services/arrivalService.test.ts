import ArrivalService from './arrivalService'
import BookingClient from '../data/bookingClient'
import arrivalFactory from '../testutils/factories/arrival'
import newArrivalFactory from '../testutils/factories/newArrival'
import { CallConfig } from '../data/restClient'

jest.mock('../data/bookingClient.ts')

describe('ArrivalService', () => {
  const bookingClient = new BookingClient(null) as jest.Mocked<BookingClient>
  const bookingClientFactory = jest.fn()

  const service = new ArrivalService(bookingClientFactory)

  beforeEach(() => {
    jest.resetAllMocks()
    bookingClientFactory.mockReturnValue(bookingClient)
  })

  describe('createArrival', () => {
    it('on success returns the arrival that has been posted', async () => {
      const arrival = arrivalFactory.build()
      const payload = newArrivalFactory.build()

      const callConfig = { token: 'some-token' } as CallConfig

      bookingClient.markAsArrived.mockResolvedValue(arrival)

      const postedArrival = await service.createArrival(callConfig, 'premisesID', 'bookingId', payload)
      expect(postedArrival).toEqual(arrival)

      expect(bookingClientFactory).toHaveBeenCalledWith(callConfig)
      expect(bookingClient.markAsArrived).toHaveBeenCalledWith('premisesID', 'bookingId', payload)
    })
  })
})
