import BookingClient from '../data/bookingClient'
import { CallConfig } from '../data/restClient'
import { extensionFactory, newExtensionFactory } from '../testutils/factories'
import ExtensionService from './extensionService'

jest.mock('../data/bookingClient.ts')

describe('ExtensionService', () => {
  const callConfig = { token: 'some-token' } as CallConfig
  const premiseId = 'premisesId'
  const bookingId = 'bookingId'

  const bookingClient = new BookingClient(null) as jest.Mocked<BookingClient>
  const bookingClientFactory = jest.fn()

  const service = new ExtensionService(bookingClientFactory)

  beforeEach(() => {
    jest.resetAllMocks()
    bookingClientFactory.mockReturnValue(bookingClient)
  })

  describe('createExtension', () => {
    it('on success returns the extension that has been posted', async () => {
      const extension = extensionFactory.build()
      const payload = newExtensionFactory.build()

      bookingClient.extendBooking.mockResolvedValue(extension)

      const postedExtension = await service.createExtension(callConfig, premiseId, bookingId, payload)
      expect(postedExtension).toEqual(extension)

      expect(bookingClientFactory).toHaveBeenCalledWith(callConfig)
      expect(bookingClient.extendBooking).toHaveBeenCalledWith(premiseId, bookingId, payload)
    })
  })
})
