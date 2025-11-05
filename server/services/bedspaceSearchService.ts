import type { Cas3BedspaceSearchParameters, Cas3ReferenceData, Characteristic } from '@approved-premises/api'
import { ReferenceData } from '../@types/ui'
import { ReferenceDataClient, RestClientBuilder } from '../data'
import BedspaceClient from '../data/bedspaceClient'
import { CallConfig } from '../data/restClient'
import { characteristicToCas3ReferenceData, filterCharacteristics } from '../utils/characteristicUtils'
import { cas3BedspaceSearchResultsToCas3v2BedspaceSearchResults } from '../utils/bedspaceSearchUtils'
import config from '../config'

export type BedspaceSearchReferenceData = {
  pdus: Array<ReferenceData>
  wheelchairAccessibility: Array<Cas3ReferenceData>
  occupancy: Array<Cas3ReferenceData>
  gender: Array<Cas3ReferenceData>
  sexualRisk: Array<Cas3ReferenceData>
}

export default class BedspaceSearchService {
  constructor(
    private readonly bedClientFactory: RestClientBuilder<BedspaceClient>,
    private readonly referenceDataClientFactory: RestClientBuilder<ReferenceDataClient>,
  ) {}

  async search(callConfig: CallConfig, searchParameters: Cas3BedspaceSearchParameters) {
    const bedspaceClient = this.bedClientFactory(callConfig)

    return cas3BedspaceSearchResultsToCas3v2BedspaceSearchResults(await bedspaceClient.search({ ...searchParameters }))
  }

  async getReferenceData(callConfig: CallConfig): Promise<BedspaceSearchReferenceData> {
    const referenceDataClient = this.referenceDataClientFactory(callConfig)

    const pdus = (
      await referenceDataClient.getReferenceData('probation-delivery-units', {
        probationRegionId: callConfig.probationRegion.id,
      })
    ).sort((a, b) => a.name.localeCompare(b.name))

    const bedspaceAttributes = (
      config.flags.enableCas3v2Api
        ? await referenceDataClient.getCas3ReferenceData('BEDSPACE_CHARACTERISTICS')
        : filterCharacteristics(
            await referenceDataClient.getReferenceData<Characteristic>('characteristics'),
            'room',
          ).map(characteristicToCas3ReferenceData)
    ).sort((a, b) => a.description.localeCompare(b.description))

    const premisesAttributes = (
      config.flags.enableCas3v2Api
        ? await referenceDataClient.getCas3ReferenceData('PREMISES_CHARACTERISTICS')
        : filterCharacteristics(
            await referenceDataClient.getReferenceData<Characteristic>('characteristics'),
            'premises',
          ).map(characteristicToCas3ReferenceData)
    ).sort((a, b) => a.description.localeCompare(b.description))

    const wheelchairAccessibility = this.filterByPropertyNames(bedspaceAttributes, 'isWheelchairAccessible')
    const occupancy = this.filterByPropertyNames(premisesAttributes, ['isSharedProperty', 'isSingleOccupancy'])
    const gender = this.filterByPropertyNames(premisesAttributes, ['isWomenOnly', 'isMenOnly'])
    const sexualRisk = this.filterByPropertyNamesAndReplace(premisesAttributes, {
      notSuitableForSexualRiskToAdults: 'Risk to adults',
      notSuitableForSexualRiskToChildren: 'Risk to children',
    })

    return { pdus, wheelchairAccessibility, occupancy, gender, sexualRisk }
  }

  private filterByPropertyNames(
    characteristics: Array<Cas3ReferenceData>,
    propertyNames: string | string[],
  ): Array<Cas3ReferenceData> {
    const propertyNamesArray = Array.isArray(propertyNames) ? propertyNames : [propertyNames]

    return characteristics.filter(item => propertyNamesArray.includes(item.name))
  }

  private filterByPropertyNamesAndReplace(
    characteristics: Array<Cas3ReferenceData>,
    propertyNamesMap: Record<string, string>,
  ): Array<Cas3ReferenceData> {
    return characteristics
      .filter(item => Object.keys(propertyNamesMap).includes(item.name))
      .map(item => ({
        ...item,
        description: propertyNamesMap[item.name] || item.name,
      }))
  }
}
