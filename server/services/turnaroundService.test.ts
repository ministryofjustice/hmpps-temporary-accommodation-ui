import BookingClient from '../data/bookingClient'
import { CallConfig } from '../data/restClient'
import { turnaroundFactory, updateTurnaroundFactory } from '../testutils/factories'
import TurnaroundService from './turnaroundService'

jest.mock('../data/bookingClient.ts')

describe('TurnaroundService', () => {
  const callConfig = { token: 'some-token' } as CallConfig
  const premiseId = 'premisesId'
  const bookingId = 'bookingId'

  const bookingClient = new BookingClient(null) as jest.Mocked<BookingClient>
  const bookingClientFactory = jest.fn()

  const service = new TurnaroundService(bookingClientFactory)

  beforeEach(() => {
    jest.resetAllMocks()
    bookingClientFactory.mockReturnValue(bookingClient)
  })

  describe('updateTurnaround', () => {
    it('on success returns the turnaround that has been posted', async () => {
      const turnaround = turnaroundFactory.build()
      const payload = updateTurnaroundFactory.build()

      bookingClient.updateTurnaround.mockResolvedValue(turnaround)

      const updatedTurnaround = await service.updateTurnaround(callConfig, premiseId, bookingId, payload)
      expect(updatedTurnaround).toEqual(turnaround)

      expect(bookingClientFactory).toHaveBeenCalledWith(callConfig)
      expect(bookingClient.updateTurnaround).toHaveBeenCalledWith(premiseId, bookingId, payload)
    })
  })
})
