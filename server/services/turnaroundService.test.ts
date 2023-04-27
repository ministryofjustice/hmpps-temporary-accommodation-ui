import BookingClient from '../data/bookingClient'
import { CallConfig } from '../data/restClient'
import { newTurnaroundFactory, turnaroundFactory } from '../testutils/factories'
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

  describe('createTurnaround', () => {
    it('on success returns the turnaround that has been posted', async () => {
      const turnaround = turnaroundFactory.build()
      const payload = newTurnaroundFactory.build()

      bookingClient.createTurnaround.mockResolvedValue(turnaround)

      const updatedTurnaround = await service.createTurnaround(callConfig, premiseId, bookingId, payload)
      expect(updatedTurnaround).toEqual(turnaround)

      expect(bookingClientFactory).toHaveBeenCalledWith(callConfig)
      expect(bookingClient.createTurnaround).toHaveBeenCalledWith(premiseId, bookingId, payload)
    })
  })
})
