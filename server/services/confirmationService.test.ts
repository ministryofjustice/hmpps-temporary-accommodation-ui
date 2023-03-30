import BookingClient from '../data/bookingClient'
import { CallConfig } from '../data/restClient'
import { confirmationFactory, newConfirmationFactory } from '../testutils/factories'
import ConfirmationService from './confirmationService'

jest.mock('../data/bookingClient.ts')

describe('ConfirmationService', () => {
  const bookingClient = new BookingClient(null) as jest.Mocked<BookingClient>

  const BookingClientFactory = jest.fn()

  const callConfig = { token: 'some-token' } as CallConfig
  const premisesId = 'premisesId'
  const bookingId = 'bookingId'

  const service = new ConfirmationService(BookingClientFactory)

  beforeEach(() => {
    jest.resetAllMocks()
    BookingClientFactory.mockReturnValue(bookingClient)
  })

  describe('createConfirmation', () => {
    it('on success returns the confirmation that has been posted', async () => {
      const newConfirmation = newConfirmationFactory.build()
      const confirmation = confirmationFactory.build()

      bookingClient.markAsConfirmed.mockResolvedValue(confirmation)

      const returnedConfirmation = await service.createConfirmation(callConfig, premisesId, bookingId, newConfirmation)
      expect(returnedConfirmation).toEqual(confirmation)

      expect(BookingClientFactory).toHaveBeenCalledWith(callConfig)
      expect(bookingClient.markAsConfirmed).toHaveBeenCalledWith(premisesId, bookingId, newConfirmation)
    })
  })
})
