import type { Nonarrival } from '@approved-premises/api'

import NonarrivalService from './nonArrivalService'
import BookingClient from '../data/bookingClient'
import NonArrivalFactory from '../testutils/factories/nonArrival'
import { createMockRequest } from '../testutils/createMockRequest'

jest.mock('../data/bookingClient.ts')

describe('NonarrivalService', () => {
  const bookingClient = new BookingClient(null) as jest.Mocked<BookingClient>
  const bookingClientFactory = jest.fn()

  const service = new NonarrivalService(bookingClientFactory)

  const request = createMockRequest()

  beforeEach(() => {
    jest.resetAllMocks()
    bookingClientFactory.mockReturnValue(bookingClient)
  })

  describe('createNonarrival', () => {
    it('on success returns the arrival that has been posted', async () => {
      const nonArrival: Nonarrival = NonArrivalFactory.build()
      const newNonArrival = {
        ...nonArrival,
        reason: nonArrival.reason.id,
      }
      bookingClient.markNonArrival.mockResolvedValue(nonArrival)

      const postedNonArrival = await service.createNonArrival(request, 'premisesID', 'bookingId', newNonArrival)

      expect(postedNonArrival).toEqual(nonArrival)

      expect(bookingClientFactory).toHaveBeenCalledWith(request)
      expect(bookingClient.markNonArrival).toHaveBeenCalledWith('premisesID', 'bookingId', newNonArrival)
    })
  })
})
