import type { Nonarrival } from '@approved-premises/api'

import BookingClient from '../data/bookingClient'
import { CallConfig } from '../data/restClient'
import { nonArrivalFactory } from '../testutils/factories'
import NonarrivalService from './nonArrivalService'

jest.mock('../data/bookingClient.ts')

describe('NonarrivalService', () => {
  const bookingClient = new BookingClient(null) as jest.Mocked<BookingClient>
  const bookingClientFactory = jest.fn()

  const service = new NonarrivalService(bookingClientFactory)

  const callConfig = { token: 'some-token' } as CallConfig

  beforeEach(() => {
    jest.resetAllMocks()
    bookingClientFactory.mockReturnValue(bookingClient)
  })

  describe('createNonarrival', () => {
    it('on success returns the arrival that has been posted', async () => {
      const nonArrival: Nonarrival = nonArrivalFactory.build()
      const newNonArrival = {
        ...nonArrival,
        reason: nonArrival.reason.id,
      }
      bookingClient.markNonArrival.mockResolvedValue(nonArrival)

      const postedNonArrival = await service.createNonArrival(callConfig, 'premisesID', 'bookingId', newNonArrival)

      expect(postedNonArrival).toEqual(nonArrival)

      expect(bookingClientFactory).toHaveBeenCalledWith(callConfig)
      expect(bookingClient.markNonArrival).toHaveBeenCalledWith('premisesID', 'bookingId', newNonArrival)
    })
  })
})
