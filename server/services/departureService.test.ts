import type { Departure } from '@approved-premises/api'

import DepartureService from './departureService'
import BookingClient from '../data/bookingClient'
import ReferenceDataClient from '../data/referenceDataClient'

import departureFactory from '../testutils/factories/departure'
import referenceDataFactory from '../testutils/factories/referenceData'
import newDepartureFactory from '../testutils/factories/newDeparture'
import { DateFormats } from '../utils/dateUtils'
import { CallConfig } from '../data/restClient'

jest.mock('../data/bookingClient.ts')
jest.mock('../data/referenceDataClient.ts')

describe('DepartureService', () => {
  const bookingClient = new BookingClient(null) as jest.Mocked<BookingClient>
  const referenceDataClient = new ReferenceDataClient(null) as jest.Mocked<ReferenceDataClient>

  const token = 'some-token'
  const callConfig = { token } as CallConfig

  const DepartureClientFactory = jest.fn()
  const ReferenceDataClientFactory = jest.fn()

  const service = new DepartureService(DepartureClientFactory, ReferenceDataClientFactory)

  beforeEach(() => {
    jest.resetAllMocks()
    DepartureClientFactory.mockReturnValue(bookingClient)
    ReferenceDataClientFactory.mockReturnValue(referenceDataClient)
  })

  describe('createDeparture', () => {
    it('on success returns the departure that has been posted', async () => {
      const newDeparture = newDepartureFactory.build()
      const departure = departureFactory.build()

      bookingClient.markDeparture.mockResolvedValue(departure)

      const postedDeparture = await service.createDeparture(callConfig, 'premisesId', 'bookingId', newDeparture)
      expect(postedDeparture).toEqual(departure)

      expect(DepartureClientFactory).toHaveBeenCalledWith(token)
      expect(bookingClient.markDeparture).toHaveBeenCalledWith('premisesId', 'bookingId', newDeparture)
    })
  })

  describe('getDeparture', () => {
    it('on success returns the departure that has been requested', async () => {
      const departure: Departure = departureFactory.build()
      bookingClient.findDeparture.mockResolvedValue(departure)

      const requestedDeparture = await service.getDeparture(callConfig, 'premisesId', 'bookingId', departure.id)

      expect(requestedDeparture).toEqual({
        ...departure,
        dateTime: DateFormats.isoDateToUIDate(departure.dateTime),
      })

      expect(DepartureClientFactory).toHaveBeenCalledWith(token)
      expect(bookingClient.findDeparture).toHaveBeenCalledWith('premisesId', 'bookingId', departure.id)
    })
  })

  describe('getReferenceData', () => {
    it('should return the reference data needed to create departures', async () => {
      const departureReasons = referenceDataFactory.buildList(2)
      const moveOnCategories = referenceDataFactory.buildList(3)

      referenceDataClient.getReferenceData.mockImplementation(category => {
        return Promise.resolve(
          {
            'departure-reasons': departureReasons,
            'move-on-categories': moveOnCategories,
          }[category],
        )
      })

      const result = await service.getReferenceData(callConfig)

      expect(result).toEqual({
        departureReasons,
        moveOnCategories,
      })

      expect(ReferenceDataClientFactory).toHaveBeenCalledWith(token)

      expect(referenceDataClient.getReferenceData).toHaveBeenCalledWith('departure-reasons')
      expect(referenceDataClient.getReferenceData).toHaveBeenCalledWith('move-on-categories')
    })
  })
})
