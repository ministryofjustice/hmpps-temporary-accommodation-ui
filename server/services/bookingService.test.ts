import BookingClient from '../data/bookingClient'
import LostBedClient from '../data/lostBedClient'
import BookingService from './bookingService'

import {
  bedFactory,
  bookingFactory,
  cas3BedspaceFactory,
  lostBedFactory,
  newBookingFactory,
} from '../testutils/factories'

import { CallConfig } from '../data/restClient'
import paths from '../paths/temporary-accommodation/manage'

jest.mock('../data/bookingClient')
jest.mock('../data/referenceDataClient')
jest.mock('../utils/bookingUtils', () => ({
  ...jest.requireActual('../utils/bookingUtils'),
  statusTag: jest.fn(),
}))
jest.mock('../data/lostBedClient')
jest.mock('../utils/lostBedUtils')

describe('BookingService', () => {
  const bookingClient = new BookingClient(null) as jest.Mocked<BookingClient>
  const lostBedClient = new LostBedClient(null) as jest.Mocked<LostBedClient>

  const bookingClientFactory = jest.fn()
  const lostBedClientFactory = jest.fn()

  const service = new BookingService(bookingClientFactory, lostBedClientFactory)
  const callConfig = { token: 'some-token' } as CallConfig

  const premisesId = 'b3dda411-7bd4-4087-b182-b9c0ba1c8b42'
  const bedspaceId = '5febd719-69cb-4697-975f-868afdf40336'

  beforeEach(() => {
    jest.resetAllMocks()
    bookingClientFactory.mockReturnValue(bookingClient)
    lostBedClientFactory.mockReturnValue(lostBedClient)
  })

  describe('createForBedspace', () => {
    it('posts a new booking with a bed ID, and on success returns the created booking', async () => {
      const booking = bookingFactory.build()
      const newBooking = newBookingFactory.build()
      bookingClient.create.mockResolvedValue(booking)

      const bedspace = cas3BedspaceFactory.build({
        id: bedspaceId,
      })

      const postedBooking = await service.createForBedspace(callConfig, premisesId, bedspace.id, newBooking)
      expect(postedBooking).toEqual(booking)

      expect(bookingClientFactory).toHaveBeenCalledWith(callConfig)
      expect(bookingClient.create).toHaveBeenCalledWith(premisesId, {
        serviceName: 'temporary-accommodation',
        bedId: bedspaceId,
        enableTurnarounds: true,
        ...newBooking,
      })
    })
  })

  describe('getListingEntries', () => {
    it('returns a sorted list of booking entries and active lost bed entries', async () => {
      const bed = bedFactory.build({ id: bedspaceId })

      const booking1 = bookingFactory.build({
        arrivalDate: '2021-02-17',
        bed,
      })

      const booking2 = bookingFactory.build({
        arrivalDate: '2023-12-13',
        bed,
      })

      const lostBed1 = lostBedFactory.active().build({
        startDate: '2022-05-09',
        bedId: bedspaceId,
      })

      const lostBed2 = lostBedFactory.active().build({
        startDate: '2024-01-01',
        bedId: bedspaceId,
      })

      const lostBedInactive = lostBedFactory.cancelled().build()

      bookingClient.allBookingsForPremisesId.mockResolvedValue([booking2, booking1])
      lostBedClient.allLostBedsForPremisesId.mockResolvedValue([lostBed2, lostBedInactive, lostBed1])

      const result = await service.getListingEntries(callConfig, premisesId, bedspaceId)

      expect(result).toEqual([
        expect.objectContaining({
          path: paths.lostBeds.show({ premisesId, bedspaceId, lostBedId: lostBed2.id }),
          body: lostBed2,
          type: 'lost-bed',
        }),
        expect.objectContaining({
          path: paths.bookings.show({ premisesId, bedspaceId, bookingId: booking2.id }),
          body: booking2,
          type: 'booking',
        }),
        expect.objectContaining({
          path: paths.lostBeds.show({ premisesId, bedspaceId, lostBedId: lostBed1.id }),
          body: lostBed1,
          type: 'lost-bed',
        }),
        expect.objectContaining({
          path: paths.bookings.show({ premisesId, bedspaceId, bookingId: booking1.id }),
          body: booking1,
          type: 'booking',
        }),
      ])

      expect(bookingClient.allBookingsForPremisesId).toHaveBeenCalledWith(premisesId)
      expect(lostBedClient.allLostBedsForPremisesId).toHaveBeenCalledWith(premisesId)
    })

    it('ignores bookings and lost beds for other rooms', async () => {
      const otherBed = bedFactory.build({
        id: 'other-bedspace-id',
      })

      const booking = bookingFactory.build({
        bed: otherBed,
      })

      const lostBed = lostBedFactory.active().build({
        bedId: 'other-bed-id',
      })

      bookingClient.allBookingsForPremisesId.mockResolvedValue([booking])
      lostBedClient.allLostBedsForPremisesId.mockResolvedValue([lostBed])

      const result = await service.getListingEntries(callConfig, premisesId, bedspaceId)

      expect(result).toEqual([])

      expect(bookingClient.allBookingsForPremisesId).toHaveBeenCalledWith(premisesId)
      expect(lostBedClient.allLostBedsForPremisesId).toHaveBeenCalledWith(premisesId)
    })
  })

  describe('getBooking', () => {
    it('returns a booking', async () => {
      const booking = bookingFactory.build()
      bookingClient.find.mockResolvedValue(booking)

      const result = await service.getBooking(callConfig, premisesId, booking.id)

      expect(result).toEqual(booking)

      expect(bookingClientFactory).toHaveBeenCalledWith(callConfig)
      expect(bookingClient.find).toHaveBeenCalledWith(premisesId, booking.id)
    })
  })
})
