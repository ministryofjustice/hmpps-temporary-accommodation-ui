import BookingClient from '../data/bookingClient'
import ConfirmationService from './confirmationService'
import newConfirmationFactory from '../testutils/factories/newConfirmation'
import confirmationFactory from '../testutils/factories/confirmation'
import { createMockRequest } from '../testutils/createMockRequest'

jest.mock('../data/bookingClient.ts')

describe('ConfirmationService', () => {
  const bookingClient = new BookingClient(null) as jest.Mocked<BookingClient>

  const BookingClientFactory = jest.fn()

  const request = createMockRequest()
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

      const returnedConfirmation = await service.createConfirmation(request, premisesId, bookingId, newConfirmation)
      expect(returnedConfirmation).toEqual(confirmation)

      expect(BookingClientFactory).toHaveBeenCalledWith(request)
      expect(bookingClient.markAsConfirmed).toHaveBeenCalledWith(premisesId, bookingId, newConfirmation)
    })
  })
})
