import BookingClient from '../data/bookingClient'
import LostBedClient from '../data/lostBedClient'
import BookingService from './bookingService'

import {
  cas3BedspaceFactory,
  cas3BookingFactory,
  cas3NewBookingFactory,
  cas3VoidBedspaceFactory,
} from '../testutils/factories'

import { CallConfig } from '../data/restClient'
import paths from '../paths/temporary-accommodation/manage'
import * as bookingUtils from '../utils/bookingUtils'
import * as lostBedUtils from '../utils/lostBedUtils'

jest.mock('../data/bookingClient')
jest.mock('../data/referenceDataClient')
jest.mock('../data/lostBedClient')

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
    jest.clearAllMocks()
    bookingClientFactory.mockReturnValue(bookingClient)
    lostBedClientFactory.mockReturnValue(lostBedClient)

    jest.spyOn(bookingUtils, 'bookingToCas3Booking')
    jest.spyOn(lostBedUtils, 'lostBedToCas3VoidBedspace')
  })

  describe('createForBedspace', () => {
    it('posts a new booking with a bed ID, and on success returns the created booking', async () => {
      const booking = cas3BookingFactory.build()
      const newBooking = cas3NewBookingFactory.build()
      bookingClient.create.mockResolvedValue(booking)

      const postedBooking = await service.createForBedspace(callConfig, premisesId, bedspaceId, newBooking)
      expect(postedBooking).toEqual(booking)

      expect(bookingClientFactory).toHaveBeenCalledWith(callConfig)
      expect(bookingClient.create).toHaveBeenCalledWith(premisesId, {
        serviceName: 'temporary-accommodation',
        enableTurnarounds: true,
        ...newBooking,
        bedspaceId,
      })

      expect(bookingUtils.bookingToCas3Booking).toHaveBeenCalledWith(booking)
    })
  })

  describe('getListingEntries', () => {
    it('returns a sorted list of booking entries and active lost bed entries', async () => {
      const bedspace = cas3BedspaceFactory.build({ id: bedspaceId })

      const booking1 = cas3BookingFactory.build({
        arrivalDate: '2021-02-17',
        bedspace,
      })

      const booking2 = cas3BookingFactory.build({
        arrivalDate: '2023-12-13',
        bedspace,
      })

      const lostBed1 = cas3VoidBedspaceFactory.active().build({
        startDate: '2022-05-09',
        bedspaceId,
      })

      const lostBed2 = cas3VoidBedspaceFactory.active().build({
        startDate: '2024-01-01',
        bedspaceId,
      })

      const lostBedInactive = cas3VoidBedspaceFactory.cancelled().build()

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

      expect(bookingUtils.bookingToCas3Booking).toHaveBeenCalledWith(booking2, 0, [booking2, booking1])
      expect(bookingUtils.bookingToCas3Booking).toHaveBeenCalledWith(booking1, 1, [booking2, booking1])
      expect(lostBedUtils.lostBedToCas3VoidBedspace).toHaveBeenCalledWith(lostBed2, 0, [
        lostBed2,
        lostBedInactive,
        lostBed1,
      ])
      expect(lostBedUtils.lostBedToCas3VoidBedspace).toHaveBeenCalledWith(lostBed1, 2, [
        lostBed2,
        lostBedInactive,
        lostBed1,
      ])
    })

    it('ignores bookings and lost beds for other rooms', async () => {
      const otherBed = cas3BedspaceFactory.build({
        id: 'other-bedspace-id',
      })

      const booking = cas3BookingFactory.build({
        bedspace: otherBed,
      })

      const lostBed = cas3VoidBedspaceFactory.active().build({
        bedspaceId: 'other-bed-id',
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
      const booking = cas3BookingFactory.build()

      bookingClient.find.mockResolvedValue(booking)

      const result = await service.getBooking(callConfig, premisesId, booking.id)

      expect(result).toEqual(booking)

      expect(bookingClientFactory).toHaveBeenCalledWith(callConfig)
      expect(bookingClient.find).toHaveBeenCalledWith(premisesId, booking.id)

      expect(bookingUtils.bookingToCas3Booking).toHaveBeenCalledWith(booking)
    })
  })
})
