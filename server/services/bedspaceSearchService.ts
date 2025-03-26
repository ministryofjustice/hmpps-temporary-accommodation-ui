import type { Cas3BedspaceSearchParameters, Characteristic } from '@approved-premises/api'
import { ReferenceData } from '../@types/ui'
import { ReferenceDataClient, RestClientBuilder } from '../data'
import BedspaceClient from '../data/bedspaceClient'
import { CallConfig } from '../data/restClient'
import { filterCharacteristics } from '../utils/characteristicUtils'

export type BedspaceSearchReferenceData = {
  pdus: Array<ReferenceData>
  wheelchairAccessibility: Array<Characteristic>
  occupancy: Array<Characteristic>
  sexualRisk: Array<Characteristic>
}

export default class BedspaceSearchService {
  constructor(
    private readonly bedClientFactory: RestClientBuilder<BedspaceClient>,
    private readonly referenceDataClientFactory: RestClientBuilder<ReferenceDataClient>,
  ) {}

  async search(callConfig: CallConfig, searchParameters: Cas3BedspaceSearchParameters) {
    const bedspaceClient = this.bedClientFactory(callConfig)

    return bedspaceClient.search({ ...searchParameters })
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
    const sexualRisk = this.filterByPropertyNamesAndReplace(premisesAttributes, {
      notSuitableForSexualRiskToAdults: 'Risk to adults',
      notSuitableForSexualRiskToChildren: 'Risk to children',
    })

    return { pdus, wheelchairAccessibility, occupancy, sexualRisk }
  }

  private filterByPropertyNames(characteristics: Characteristic[], propertyNames: string | string[]): Characteristic[] {
    const propertyNamesArray = Array.isArray(propertyNames) ? propertyNames : [propertyNames]

    return characteristics.filter(item => propertyNamesArray.includes(item.propertyName))
  }

  private filterByPropertyNamesAndReplace(
    characteristics: Characteristic[],
    propertyNamesMap: Record<string, string>,
  ): Characteristic[] {
    return characteristics
      .filter(item => Object.keys(propertyNamesMap).includes(item.propertyName))
      .map(item => ({
        ...item,
        name: propertyNamesMap[item.propertyName] || item.propertyName,
      }))
  }
}
