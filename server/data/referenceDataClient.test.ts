import {
  CancellationReason,
  Cas3RefDataType,
  Characteristic,
  DepartureReason,
  DestinationProvider,
  LocalAuthorityArea,
  MoveOnCategory,
  NonArrivalReason,
  ProbationDeliveryUnit,
  ProbationRegion,
} from '@approved-premises/api'
import {
  cas3BedspaceCharacteristicsFactory,
  cas3PremisesCharacteristicsFactory,
  cas3VoidBedspaceReasonFactory,
  referenceDataFactory,
} from '../testutils/factories'
import ReferenceDataClient from './referenceDataClient'
import { CallConfig } from './restClient'
import describeClient from '../testutils/describeClient'
import paths from '../paths/api'

describeClient('ReferenceDataClient', provider => {
  let referenceDataClient: ReferenceDataClient
  const callConfig = { token: 'some-token' } as CallConfig

  beforeEach(() => {
    referenceDataClient = new ReferenceDataClient(callConfig)
  })

  describe('getReferenceData', () => {
    const data = {
      'departure-reasons': referenceDataFactory.departureReasons().buildList(5) as Array<DepartureReason>,
      'move-on-categories': referenceDataFactory.moveOnCategories().buildList(5) as Array<MoveOnCategory>,
      'destination-providers': referenceDataFactory.destinationProviders().buildList(5) as Array<DestinationProvider>,
      'cancellation-reasons': referenceDataFactory.cancellationReasons().buildList(5) as Array<CancellationReason>,
      'non-arrival-reasons': referenceDataFactory.nonArrivalReason().buildList(5) as Array<NonArrivalReason>,
      'probation-regions': referenceDataFactory.probationRegion().buildList(5) as Array<ProbationRegion>,
      pdus: referenceDataFactory.pdu().buildList(5) as Array<ProbationDeliveryUnit>,
      'local-authorities': referenceDataFactory.localAuthority().buildList(5) as Array<LocalAuthorityArea>,
      characteristics: referenceDataFactory.characteristic('premises').buildList(5) as Array<Characteristic>,
    }

    Object.keys(data).forEach((key: keyof typeof data) => {
      it('should return an array of reference data', async () => {
        await provider.addInteraction({
          state: 'Reference data exists',
          uponReceiving: 'a request for reference data',
          withRequest: {
            method: 'GET',
            path: paths.referenceData({ objectType: key }),
            headers: {
              authorization: `Bearer ${callConfig.token}`,
            },
          },
          willRespondWith: {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: data[key],
          },
        })

        const output = await referenceDataClient.getReferenceData(key)
        expect(output).toEqual(data[key])
      })
    })
  })

  describe('getCas3ReferenceData', () => {
    it.each([
      ['PREMISES_CHARACTERISTICS', cas3PremisesCharacteristicsFactory.buildList(3)],
      ['BEDSPACE_CHARACTERISTICS', cas3BedspaceCharacteristicsFactory.buildList(3)],
      ['VOID_BEDSPACE_REASONS', cas3VoidBedspaceReasonFactory.buildList(3)],
    ])('returns reference data of type %s', async (type: Cas3RefDataType, records) => {
      await provider.addInteraction({
        state: 'Reference data exists',
        uponReceiving: `a request for Cas3 reference data of type ${type}`,
        withRequest: {
          method: 'GET',
          path: paths.cas3.referenceData({}),
          query: {
            type,
          },
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: records,
        },
      })

      const output = await referenceDataClient.getCas3ReferenceData(type)
      expect(output).toEqual(records)
    })
  })
})
