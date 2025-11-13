import {
  Cas3Bedspace,
  Cas3BedspaceArchiveAction,
  type Cas3BedspaceStatus,
  Cas3Bedspaces,
  Cas3NewBedspace,
  Cas3UpdateBedspace,
  Characteristic,
} from '@approved-premises/api'
import { SummaryList } from '@approved-premises/ui'
import { CallConfig } from '../data/restClient'
import { RestClientBuilder } from '../data'
import BedspaceClient from '../data/bedspaceClient'
import ReferenceDataClient from '../data/referenceDataClient'
import { DateFormats } from '../utils/dateUtils'
import { convertToTitleCase } from '../utils/utils'
import { filterCharacteristics } from '../utils/characteristicUtils'
import { bedspaceStatus } from '../utils/bedspaceUtils'

export type BedspaceReferenceData = {
  characteristics: Array<Characteristic>
}

export default class BedspaceService {
  constructor(
    private readonly bedspaceClientFactory: RestClientBuilder<BedspaceClient>,
    private readonly referenceDataClientFactory: RestClientBuilder<ReferenceDataClient>,
  ) {}

  async getSingleBedspace(callConfig: CallConfig, premisesId: string, bedspaceId: string): Promise<Cas3Bedspace> {
    const bedspaceClient = this.bedspaceClientFactory(callConfig)
    return bedspaceClient.find(premisesId, bedspaceId)
  }

  async getBedspacesForPremises(callConfig: CallConfig, premisesId: string): Promise<Cas3Bedspaces> {
    const bedspaceClient = this.bedspaceClientFactory(callConfig)

    return bedspaceClient.get(premisesId)
  }

  summaryList(bedspace: Cas3Bedspace): SummaryList {
    const rows = [
      {
        key: { text: 'Bedspace status' },
        value: { html: this.formatBedspaceStatus(bedspace) },
      },
      {
        key: { text: 'Start date' },
        value: { text: this.formatBedspaceDate(bedspace.startDate) },
      },
    ]

    if (bedspace.archiveHistory && bedspace.archiveHistory.length > 0) {
      rows.push({
        key: { text: 'Archive history' },
        value: {
          html: this.formatArchiveHistory(bedspace.archiveHistory),
        },
      })
    }

    rows.push(
      {
        key: { text: 'Bedspace details' },
        value: { html: this.formatBedspaceDetails(bedspace.characteristics) || 'None' },
      },
      {
        key: { text: 'Additional bedspace details' },
        value: { html: this.formatNotes(bedspace.notes ?? 'None') },
      },
    )
    return {
      rows,
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

  private formatBedspaceStatus(bedspace: Cas3Bedspace): string {
    const tagClass = this.getBedspaceStatusTagColour(bedspace.status)
    let html = `<strong class="govuk-tag ${tagClass}">${convertToTitleCase(bedspace.status)}</strong>`

    if (bedspace.status === 'online' && bedspace.endDate) {
      html += `<br><span class="govuk-!-display-inline-block govuk-!-margin-top-2">Scheduled archive date ${this.formatBedspaceDate(bedspace.endDate)}</span>`
    } else if (bedspace.status === 'archived' && new Date(bedspace.scheduleUnarchiveDate) > new Date()) {
      html += `<br><span class="govuk-!-display-inline-block govuk-!-margin-top-2">Scheduled online date ${this.formatBedspaceDate(bedspace.scheduleUnarchiveDate)}</span>`
    }

    return html
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

  private formatArchiveHistory(archiveHistory: Array<Cas3BedspaceArchiveAction>): string {
    return archiveHistory
      .map(action => {
        const verb = action.status === 'archived' ? 'Archive' : convertToTitleCase(action.status)
        return `<div>${verb} date ${this.formatBedspaceDate(action.date)}</div>`
      })
      .join('')
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

  async updateBedspace(
    callConfig: CallConfig,
    premisesId: string,
    bedspaceId: string,
    updatedBedspace: Cas3UpdateBedspace,
  ): Promise<Cas3Bedspace> {
    const bedspaceClient = this.bedspaceClientFactory(callConfig)
    return bedspaceClient.update(premisesId, bedspaceId, updatedBedspace)
  }

  async archiveBedspace(
    callConfig: CallConfig,
    premisesId: string,
    bedspaceId: string,
    endDate: string,
  ): Promise<void> {
    const bedspaceClient = this.bedspaceClientFactory(callConfig)
    return bedspaceClient.archive(premisesId, bedspaceId, { endDate })
  }

  async unarchiveBedspace(
    callConfig: CallConfig,
    premisesId: string,
    bedspaceId: string,
    restartDate: string,
  ): Promise<void> {
    const bedspaceClient = this.bedspaceClientFactory(callConfig)
    return bedspaceClient.unarchive(premisesId, bedspaceId, { restartDate })
  }

  async cancelArchiveBedspace(callConfig: CallConfig, premisesId: string, bedspaceId: string): Promise<Cas3Bedspace> {
    const bedspaceClient = this.bedspaceClientFactory(callConfig)
    return bedspaceClient.cancelArchive(premisesId, bedspaceId)
  }

  async cancelUnarchiveBedspace(callConfig: CallConfig, premisesId: string, bedspaceId: string): Promise<Cas3Bedspace> {
    const bedspaceClient = this.bedspaceClientFactory(callConfig)
    return bedspaceClient.cancelUnarchive(premisesId, bedspaceId)
  }

  async canArchiveBedspace(
    callConfig: CallConfig,
    premisesId: string,
    bedspaceId: string,
  ): Promise<{ date?: string; entityId?: string; entityReference?: string }> {
    const bedspaceClient = this.bedspaceClientFactory(callConfig)
    return bedspaceClient.canArchive(premisesId, bedspaceId)
  }

  summaryListForBedspaceStatus(bedspace: Cas3Bedspace): SummaryList {
    let endDate = 'No end date added'

    if (bedspace.endDate) {
      endDate = DateFormats.isoDateToUIDate(bedspace.endDate)

      if (bedspaceStatus(bedspace) === 'online') {
        endDate += ` (${DateFormats.isoDateToDaysFromNow(bedspace.endDate)})`
      }
    }

    return {
      rows: [
        {
          key: this.textValue('Bedspace status'),
          value: this.htmlValue(
            bedspaceStatus(bedspace) === 'online'
              ? `<span class="govuk-tag govuk-tag--green">Online</span>`
              : `<span class="govuk-tag govuk-tag--grey">Archived</span>`,
          ),
        },
        {
          key: this.textValue('Bedspace end date'),
          value: this.textValue(endDate),
        },
      ],
    }
  }

  private textValue(value: string) {
    return { text: value }
  }

  private htmlValue(value: string) {
    return { html: value }
  }

  private formatNotes(notes: string): string {
    return notes.replace(/\n/g, '<br />')
  }
}
