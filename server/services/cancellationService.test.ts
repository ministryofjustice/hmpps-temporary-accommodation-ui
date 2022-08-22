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

  const CancellationClientFactory = jest.fn()
  const ReferenceDataClientFactory = jest.fn()

  const token = 'SOME_TOKEN'

  const service = new CancellationService(CancellationClientFactory, ReferenceDataClientFactory)

  beforeEach(() => {
    jest.resetAllMocks()
    CancellationClientFactory.mockReturnValue(cancellationClient)
    ReferenceDataClientFactory.mockReturnValue(referenceDataClient)
  })

  describe('createCancellation', () => {
    it('on success returns the cancellation that has been posted', async () => {
      const cancellationDto = cancellationDtoFactory.build()
      const cancellation = cancellationFactory.build()

      cancellationClient.create.mockResolvedValue(cancellation)

      const postedDeparture = await service.createCancellation(token, 'premisesId', 'bookingId', cancellationDto)
      expect(postedDeparture).toEqual(cancellation)

      expect(CancellationClientFactory).toHaveBeenCalledWith(token)
      expect(cancellationClient.create).toHaveBeenCalledWith('premisesId', 'bookingId', cancellationDto)
    })
  })

  describe('getCancellationReasons', () => {
    it('should return the cancellation reasons', async () => {
      const cancellationReasons = referenceDataFactory.buildList(2)

      referenceDataClient.getReferenceData.mockResolvedValue(cancellationReasons)

      const result = await service.getCancellationReasons(token)

      expect(result).toEqual(cancellationReasons)

      expect(ReferenceDataClientFactory).toHaveBeenCalledWith(token)
      expect(referenceDataClient.getReferenceData).toHaveBeenCalledWith('cancellation-reasons')
    })
  })

  describe('getCancellation', () => {
    it('on success returns the cancellation that has been requested', async () => {
      const cancellation = cancellationFactory.build()
      cancellationClient.get.mockResolvedValue(cancellation)

      const requestedDeparture = await service.getCancellation(token, 'premisesId', 'bookingId', cancellation.id)

      expect(requestedDeparture).toEqual(cancellation)

      expect(CancellationClientFactory).toHaveBeenCalledWith(token)
      expect(cancellationClient.get).toHaveBeenCalledWith('premisesId', 'bookingId', cancellation.id)
    })
  })
})
