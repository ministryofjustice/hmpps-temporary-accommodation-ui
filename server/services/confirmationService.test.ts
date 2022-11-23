import BookingClient from '../data/bookingClient'
import ConfirmationService from './confirmationService'
import newConfirmationFactory from '../testutils/factories/newConfirmation'
import confirmationFactory from '../testutils/factories/confirmation'

jest.mock('../data/bookingClient.ts')

describe('ConfirmationService', () => {
  const bookingClient = new BookingClient(null) as jest.Mocked<BookingClient>

  const BookingClientFactory = jest.fn()

  const token = 'SOME_TOKEN'
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

      const returnedConfirmation = await service.createConfirmation(token, premisesId, bookingId, newConfirmation)
      expect(returnedConfirmation).toEqual(confirmation)

      expect(BookingClientFactory).toHaveBeenCalledWith(token)
      expect(bookingClient.markAsConfirmed).toHaveBeenCalledWith(premisesId, bookingId, newConfirmation)
    })
  })
})
