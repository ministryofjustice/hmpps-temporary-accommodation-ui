import {
  CancellationReason,
  Characteristic,
  DepartureReason,
  DestinationProvider,
  LocalAuthorityArea,
  LostBedReason,
  MoveOnCategory,
  NonArrivalReason,
  ProbationDeliveryUnit,
  ProbationRegion,
} from '@approved-premises/api'
import { referenceDataFactory } from '../testutils/factories'
import ReferenceDataClient from './referenceDataClient'
import { CallConfig } from './restClient'
import describeClient from '../testutils/describeClient'

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
      'lost-bed-reasons': referenceDataFactory.lostBedReasons().buildList(5) as Array<LostBedReason>,
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
            path: `/reference-data/${key}`,
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
})
