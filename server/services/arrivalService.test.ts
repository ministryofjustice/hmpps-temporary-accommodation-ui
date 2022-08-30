import type { Arrival } from 'approved-premises'

import ArrivalService from './arrivalService'
import BookingClient from '../data/bookingClient'
import ArrivalFactory from '../testutils/factories/arrival'

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
      const arrival: Arrival = ArrivalFactory.build()
      const token = 'SOME_TOKEN'
      bookingClient.markAsArrived.mockResolvedValue(arrival)

      const postedArrival = await service.createArrival(token, 'premisesID', 'bookingId', arrival)
      expect(postedArrival).toEqual(arrival)

      expect(bookingClientFactory).toHaveBeenCalledWith(token)
      expect(bookingClient.markAsArrived).toHaveBeenCalledWith('premisesID', 'bookingId', arrival)
    })
  })
})
