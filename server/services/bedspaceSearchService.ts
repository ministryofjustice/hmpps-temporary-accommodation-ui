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
  occupancy: Array<Characteristic>
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

    const premisesAttributes = filterCharacteristics(
      await referenceDataClient.getReferenceData<Characteristic>('characteristics'),
      'premises',
    ).sort((a, b) => a.name.localeCompare(b.name))

    const wheelchairAccessibility = this.filterByPropertyNames(bedspaceAttributes, 'isWheelchairAccessible')
    const occupancy = this.filterByPropertyNames(premisesAttributes, ['isSharedProperty', 'isSingleOccupancy'])

    return { pdus, wheelchairAccessibility, occupancy }
  }

  private filterByPropertyNames(characteristics: Characteristic[], propertyNames: string | string[]): Characteristic[] {
    const propertyNamesArray = Array.isArray(propertyNames) ? propertyNames : [propertyNames]

    return characteristics.filter(item => propertyNamesArray.includes(item.propertyName))
  }
}
