import type {
  Characteristic,
  LocalAuthorityArea,
  NewPremises,
  TemporaryAccommodationPremises as Premises,
  StaffMember,
  UpdatePremises,
} from '@approved-premises/api'
import type { ReferenceData, SummaryList, TableRow } from '@approved-premises/ui'
import type { PremisesClient, ReferenceDataClient, RestClientBuilder } from '../data'
import pduJson from '../data/pdus.json'
import paths from '../paths/temporary-accommodation/manage'

import { CallConfig } from '../data/restClient'
import { filterCharacteristics, formatCharacteristics } from '../utils/characteristicUtils'
import { DateFormats } from '../utils/dateUtils'
import { formatStatus, getDateRangesWithNegativeBeds, NegativeDateRange } from '../utils/premisesUtils'
import { escape, formatLines } from '../utils/viewUtils'

export type PremisesReferenceData = {
  localAuthorities: Array<LocalAuthorityArea>
  characteristics: Array<Characteristic>
  probationRegions: Array<ReferenceData>
  pdus: Array<ReferenceData>
}

export default class PremisesService {
  constructor(
    private readonly premisesClientFactory: RestClientBuilder<PremisesClient>,
    private readonly referenceDataClientFactory: RestClientBuilder<ReferenceDataClient>,
  ) {}

  async getStaffMembers(callConfig: CallConfig, premisesId: string): Promise<Array<StaffMember>> {
    const premisesClient = this.premisesClientFactory(callConfig)

    const staffMembers = await premisesClient.getStaffMembers(premisesId)

    return staffMembers
  }

  async getReferenceData(callConfig: CallConfig): Promise<PremisesReferenceData> {
    const referenceDataClient = this.referenceDataClientFactory(callConfig)

    const localAuthorities = (
      (await referenceDataClient.getReferenceData('local-authority-areas')) as Array<LocalAuthorityArea>
    ).sort((a, b) => a.name.localeCompare(b.name))

    const characteristics = filterCharacteristics(
      await referenceDataClient.getReferenceData<Characteristic>('characteristics'),
      'premises',
    ).sort((a, b) => a.name.localeCompare(b.name))

    const probationRegions = (await referenceDataClient.getReferenceData('probation-regions')).sort((a, b) =>
      a.name.localeCompare(b.name),
    )

    const pdus = pduJson.sort((a, b) => a.name.localeCompare(b.name))

    return { localAuthorities, characteristics, probationRegions, pdus }
  }

  async tableRows(callConfig: CallConfig): Promise<Array<TableRow>> {
    const premisesClient = this.premisesClientFactory(callConfig)
    const premises = await premisesClient.all()

    return premises
      .map(p => ({ premises: p, shortAddress: `${p.addressLine1}, ${p.postcode}` }))
      .sort((a, b) => a.shortAddress.localeCompare(b.shortAddress))
      .map(entry => {
        return [
          this.textValue(entry.shortAddress),
          this.textValue(`${entry.premises.bedCount}`),
          this.textValue(entry.premises.pdu),
          this.htmlValue(
            `<a href="${paths.premises.show({
              premisesId: entry.premises.id,
            })}">Manage<span class="govuk-visually-hidden"> ${entry.shortAddress}</span></a>`,
          ),
        ]
      })
  }

  async getPremises(callConfig: CallConfig, id: string): Promise<Premises> {
    const premisesClient = this.premisesClientFactory(callConfig)
    const premises = await premisesClient.find(id)

    return premises
  }

  async getPremisesDetails(
    callConfig: CallConfig,
    id: string,
  ): Promise<{ premises: Premises; summaryList: SummaryList }> {
    const premisesClient = this.premisesClientFactory(callConfig)
    const premises = await premisesClient.find(id)

    const summaryList = await this.summaryListForPremises(premises)

    return { premises, summaryList }
  }

  async getOvercapacityMessage(callConfig: CallConfig, premisesId: string): Promise<string[] | string> {
    const premisesClient = this.premisesClientFactory(callConfig)
    const premisesDateCapacities = await premisesClient.capacity(premisesId)

    const overcapacityDateRanges = getDateRangesWithNegativeBeds(premisesDateCapacities)

    const overcapacityMessage = this.generateOvercapacityMessage(overcapacityDateRanges)

    return overcapacityMessage ? [overcapacityMessage] : ''
  }

  async getPremisesSelectList(callConfig: CallConfig): Promise<Array<{ text: string; value: string }>> {
    const premisesClient = this.premisesClientFactory(callConfig)
    const premises = await premisesClient.all()

    return premises
      .map(singlePremises => {
        return { text: `${singlePremises.name}`, value: `${singlePremises.id}` }
      })
      .sort((a, b) => {
        if (a.text < b.text) {
          return -1
        }
        if (a.text > b.text) {
          return 1
        }
        return 0
      })
  }

  async getUpdatePremises(callConfig: CallConfig, id: string): Promise<UpdatePremises> {
    const premisesClient = this.premisesClientFactory(callConfig)
    const premises = await premisesClient.find(id)

    return {
      ...premises,
      localAuthorityAreaId: premises.localAuthorityArea?.id,
      characteristicIds: premises.characteristics.map(characteristic => characteristic.id),
      probationRegionId: premises.probationRegion.id,
      pdu: premises.pdu,
    }
  }

  async create(callConfig: CallConfig, newPremises: NewPremises): Promise<Premises> {
    const premisesClient = this.premisesClientFactory(callConfig)
    const premises = await premisesClient.create(newPremises)

    return premises
  }

  async update(callConfig: CallConfig, id: string, updatePremises: UpdatePremises): Promise<Premises> {
    const premisesClient = this.premisesClientFactory(callConfig)
    const premises = await premisesClient.update(id, updatePremises)

    return premises
  }

  private async summaryListForPremises(premises: Premises): Promise<SummaryList> {
    const addressLines = [premises.addressLine1, premises.addressLine2, premises.town, premises.postcode]
      .filter(line => line && line !== '')
      .map(line => escape(line))

    return {
      rows: [
        {
          key: this.textValue('Address'),
          value: this.htmlValue(addressLines.join('<br />')),
        },
        {
          key: this.textValue('Local authority'),
          value: this.textValue(premises.localAuthorityArea?.name),
        },
        {
          key: this.textValue('Probation region'),
          value: this.textValue(premises.probationRegion.name),
        },
        {
          key: this.textValue('PDU'),
          value: this.textValue(premises.pdu),
        },
        {
          key: this.textValue('Attributes'),
          value: formatCharacteristics(premises.characteristics),
        },
        {
          key: this.textValue('Status'),
          value: this.textValue(formatStatus(premises.status)),
        },
        {
          key: this.textValue('Notes'),
          value: this.htmlValue(formatLines(premises.notes)),
        },
      ],
    }
  }

  private generateOvercapacityMessage(overcapacityDateRanges: NegativeDateRange[]) {
    if (overcapacityDateRanges.length === 1) {
      if (!overcapacityDateRanges[0].end) {
        return `<h4 class="govuk-!-margin-top-0 govuk-!-margin-bottom-2">The premises is over capacity on ${DateFormats.isoDateToUIDate(
          overcapacityDateRanges[0].start,
        )}</h4>`
      }
      return `<h4 class="govuk-!-margin-top-0 govuk-!-margin-bottom-2">The premises is over capacity for the period ${DateFormats.isoDateToUIDate(
        overcapacityDateRanges[0].start,
      )} to ${DateFormats.isoDateToUIDate(overcapacityDateRanges[0].end)}</h4>`
    }

    if (overcapacityDateRanges.length > 1) {
      const dateRanges = overcapacityDateRanges
        .map((dateRange: NegativeDateRange) =>
          !dateRange.end
            ? `<li>${DateFormats.isoDateToUIDate(dateRange.start)}</li>`
            : `<li>${DateFormats.isoDateToUIDate(dateRange.start)} to ${DateFormats.isoDateToUIDate(
                dateRange.end,
              )}</li>`,
        )
        .join('')
      return `<h4 class="govuk-!-margin-top-0 govuk-!-margin-bottom-2">The premises is over capacity for the periods:</h4>
        <ul class="govuk-list govuk-list--bullet">${dateRanges}</ul>`
    }
    return ''
  }

  private textValue(value: string) {
    return { text: value }
  }

  private htmlValue(value: string) {
    return { html: value }
  }
}
