import { Cas3Bedspace, type Cas3BedspaceStatus, Cas3NewBedspace, Characteristic } from '@approved-premises/api'
import { SummaryList } from '@approved-premises/ui'
import { CallConfig } from '../../data/restClient'
import { RestClientBuilder } from '../../data'
import BedspaceClient from '../../data/v2/bedspaceClient'
import ReferenceDataClient from '../../data/referenceDataClient'
import { DateFormats } from '../../utils/dateUtils'
import { convertToTitleCase } from '../../utils/utils'
import { filterCharacteristics } from '../../utils/characteristicUtils'

export type BedspaceReferenceData = {
  characteristics: Array<Characteristic>
}

export default class BedspaceService {
  constructor(
    private readonly bedspaceClientFactory: RestClientBuilder<BedspaceClient>,
    private readonly referenceDataClientFactory: RestClientBuilder<ReferenceDataClient>,
  ) {}

  async getSingleBedspaceDetails(
    callConfig: CallConfig,
    premisesId: string,
    bedspaceId: string,
  ): Promise<Cas3Bedspace & { summary: SummaryList }> {
    const bedspaceClient = this.bedspaceClientFactory(callConfig)

    const bedspace = await bedspaceClient.find(premisesId, bedspaceId)

    return {
      ...bedspace,
      summary: this.summaryList(bedspace),
    }
  }

  private summaryList(bedspace: Cas3Bedspace): SummaryList {
    return {
      rows: [
        {
          key: { text: 'Bedspace status' },
          value: { html: this.formatBedspaceStatus(bedspace.status) },
        },
        {
          key: { text: 'Start date' },
          value: { text: this.formatBedspaceDate(bedspace.startDate) },
        },
        {
          key: { text: 'Bedspace details' },
          value: { html: this.formatBedspaceDetails(bedspace.characteristics) },
        },
        {
          key: { text: 'Additional bedspace details' },
          value: { text: bedspace.notes ?? '' },
        },
      ],
    }
  }

  private getBedspaceStatusTagColour(status: Cas3BedspaceStatus): string {
    switch (status) {
      case 'online':
        return 'govuk-tag--green'
      case 'archived':
        return 'govuk-tag--grey'
      case 'upcoming':
        return 'govuk-tag--blue'
      default:
        return 'govuk-tag--grey'
    }
  }

  private formatBedspaceStatus(status: Cas3BedspaceStatus): string {
    const tagClass = this.getBedspaceStatusTagColour(status)
    return `<strong class="govuk-tag ${tagClass}">${convertToTitleCase(status)}</strong>`
  }

  private formatBedspaceDate(dateString: string | undefined | null): string {
    if (dateString === undefined || dateString === null || dateString === '') {
      return ''
    }

    return DateFormats.isoDateToUIDate(dateString)
  }

  private formatBedspaceDetails(characteristics: Array<Characteristic>): string {
    return characteristics
      .map(characteristic => `<span class="hmpps-tag-filters">${characteristic.name}</span>`)
      .join(' ')
  }

  async getReferenceData(callConfig: CallConfig): Promise<BedspaceReferenceData> {
    const referenceDataClient = this.referenceDataClientFactory(callConfig)

    const characteristics = filterCharacteristics(
      await referenceDataClient.getReferenceData<Characteristic>('characteristics'),
      'room',
    ).sort((a, b) => a.name.localeCompare(b.name))

    return { characteristics }
  }

  async createBedspace(
    callConfig: CallConfig,
    premisesId: string,
    newBedspace: Cas3NewBedspace,
  ): Promise<Cas3Bedspace> {
    const bedspaceClient = this.bedspaceClientFactory(callConfig)
    return bedspaceClient.create(premisesId, newBedspace)
  }
}
