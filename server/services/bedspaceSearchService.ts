import type {
  TemporaryAccommodationBedSearchParameters as BedSearchParameters,
  Characteristic,
} from '@approved-premises/api'
import { ReferenceData } from '../@types/ui'
import { ReferenceDataClient, RestClientBuilder } from '../data'
import BedClient from '../data/bedClient'
import { CallConfig } from '../data/restClient'
import { filterCharacteristics } from '../utils/characteristicUtils'

export type BedspaceSearchReferenceData = {
  pdus: Array<ReferenceData>
  wheelchairAccessibility: Array<Characteristic>
}

export default class BedspaceSearchService {
  constructor(
    private readonly bedClientFactory: RestClientBuilder<BedClient>,
    private readonly referenceDataClientFactory: RestClientBuilder<ReferenceDataClient>,
  ) {}

  async search(callConfig: CallConfig, searchParameters: Omit<BedSearchParameters, 'serviceName'>) {
    const bedClient = this.bedClientFactory(callConfig)

    return bedClient.search({
      serviceName: 'temporary-accommodation',
      ...searchParameters,
    })
  }

  async getReferenceData(callConfig: CallConfig): Promise<BedspaceSearchReferenceData> {
    const referenceDataClient = this.referenceDataClientFactory(callConfig)

    const pdus = (
      await referenceDataClient.getReferenceData('probation-delivery-units', {
        probationRegionId: callConfig.probationRegion.id,
      })
    ).sort((a, b) => a.name.localeCompare(b.name))

    const bedspaceAttributes = filterCharacteristics(
      await referenceDataClient.getReferenceData<Characteristic>('characteristics'),
      'room',
    ).sort((a, b) => a.name.localeCompare(b.name))

    const wheelchairAccessibility = this.filterByPropertyName(bedspaceAttributes, 'isWheelchairAccessible')

    return { pdus, wheelchairAccessibility }
  }

  private filterByPropertyName(characteristics: Characteristic[], propertyName: string): Characteristic[] {
    return characteristics.filter(item => item.propertyName === propertyName)
  }
}
