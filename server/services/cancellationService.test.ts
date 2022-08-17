import CancellationService from './cancellationService'
import CancellationClient from '../data/cancellationClient'
import ReferenceDataClient from '../data/referenceDataClient'

import cancellationDtoFactory from '../testutils/factories/cancellationDto'
import cancellationFactory from '../testutils/factories/cancellation'
import referenceDataFactory from '../testutils/factories/referenceData'

jest.mock('../data/cancellationClient.ts')
jest.mock('../data/referenceDataClient.ts')

describe('DepartureService', () => {
  const cancellationClient = new CancellationClient(null) as jest.Mocked<CancellationClient>
  const referenceDataClient = new ReferenceDataClient(null) as jest.Mocked<ReferenceDataClient>
  let service: CancellationService

  const CancellationClientFactory = jest.fn()
  const ReferenceDataClientFactory = jest.fn()

  beforeEach(() => {
    jest.resetAllMocks()
    CancellationClientFactory.mockReturnValue(cancellationClient)
    ReferenceDataClientFactory.mockReturnValue(referenceDataClient)
    service = new CancellationService(CancellationClientFactory, ReferenceDataClientFactory)
  })

  describe('createCancellation', () => {
    it('on success returns the cancellation that has been posted', async () => {
      const cancellationDto = cancellationDtoFactory.build()
      const cancellation = cancellationFactory.build()

      cancellationClient.create.mockResolvedValue(cancellation)

      const postedDeparture = await service.createCancellation('premisesId', 'bookingId', cancellationDto)
      expect(postedDeparture).toEqual(cancellation)
      expect(cancellationClient.create).toHaveBeenCalledWith('premisesId', 'bookingId', cancellationDto)
    })
  })

  describe('getCancellationReasons', () => {
    it('should return the cancellation reasons', async () => {
      const cancellationReasons = referenceDataFactory.buildList(2)

      referenceDataClient.getReferenceData.mockResolvedValue(cancellationReasons)

      const result = await service.getCancellationReasons()

      expect(result).toEqual(cancellationReasons)

      expect(referenceDataClient.getReferenceData).toHaveBeenCalledWith('cancellation-reasons')
    })
  })

  describe('getCancellation', () => {
    it('on success returns the cancellation that has been requested', async () => {
      const cancellation = cancellationFactory.build()
      cancellationClient.get.mockResolvedValue(cancellation)

      const requestedDeparture = await service.getCancellation('premisesId', 'bookingId', cancellation.id)

      expect(requestedDeparture).toEqual(cancellation)
      expect(cancellationClient.get).toHaveBeenCalledWith('premisesId', 'bookingId', cancellation.id)
    })
  })
})
