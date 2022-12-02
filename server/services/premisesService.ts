import type { TableRow, SummaryList, ReferenceData } from '@approved-premises/ui'
import type {
  StaffMember,
  NewPremises,
  Premises,
  Characteristic,
  UpdatePremises,
  LocalAuthorityArea,
} from '@approved-premises/api'
import type { RestClientBuilder, PremisesClient, ReferenceDataClient } from '../data'
import paths from '../paths/temporary-accommodation/manage'

import { DateFormats } from '../utils/dateUtils'
import { getDateRangesWithNegativeBeds, formatStatus, NegativeDateRange } from '../utils/premisesUtils'
import { escape, formatLines } from '../utils/viewUtils'
import { formatCharacteristics, filterCharacteristics } from '../utils/characteristicUtils'

export type PremisesReferenceData = {
  localAuthorities: Array<LocalAuthorityArea>
  characteristics: Array<Characteristic>
  probationRegions: Array<ReferenceData>
}

export default class PremisesService {
  constructor(
    private readonly premisesClientFactory: RestClientBuilder<PremisesClient>,
    private readonly referenceDataClientFactory: RestClientBuilder<ReferenceDataClient>,
  ) {}

  async getStaffMembers(token: string, premisesId: string): Promise<Array<StaffMember>> {
    const premisesClient = this.premisesClientFactory(token)

    const staffMembers = await premisesClient.getStaffMembers(premisesId)

    return staffMembers
  }

  async getReferenceData(token: string): Promise<PremisesReferenceData> {
    const referenceDataClient = this.referenceDataClientFactory(token)

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

    return { localAuthorities, characteristics, probationRegions }
  }

  async tableRows(token: string): Promise<Array<TableRow>> {
    const premisesClient = this.premisesClientFactory(token)
    const premises = await premisesClient.all()

    return premises
      .map(p => ({ premises: p, shortAddress: `${p.addressLine1}, ${p.postcode}` }))
      .sort((a, b) => a.shortAddress.localeCompare(b.shortAddress))
      .map(entry => {
        return [
          this.textValue(entry.shortAddress),
          this.textValue(`${entry.premises.bedCount}`),
          this.textValue(''),
          this.textValue(''),
          this.htmlValue(
            `<a href="${paths.premises.show({
              premisesId: entry.premises.id,
            })}">Manage<span class="govuk-visually-hidden"> ${entry.shortAddress}</span></a>`,
          ),
        ]
      })
  }

  async getPremises(token: string, id: string): Promise<Premises> {
    const premisesClient = this.premisesClientFactory(token)
    const premises = await premisesClient.find(id)

    return premises
  }

  async getPremisesDetails(token: string, id: string): Promise<{ premises: Premises; summaryList: SummaryList }> {
    const premisesClient = this.premisesClientFactory(token)
    const premises = await premisesClient.find(id)

    const summaryList = await this.summaryListForPremises(premises)

    return { premises, summaryList }
  }

  async getOvercapacityMessage(token: string, premisesId: string): Promise<string[] | string> {
    const premisesClient = this.premisesClientFactory(token)
    const premisesDateCapacities = await premisesClient.capacity(premisesId)

    const overcapacityDateRanges = getDateRangesWithNegativeBeds(premisesDateCapacities)

    const overcapacityMessage = this.generateOvercapacityMessage(overcapacityDateRanges)

    return overcapacityMessage ? [overcapacityMessage] : ''
  }

  async getPremisesSelectList(token: string): Promise<Array<{ text: string; value: string }>> {
    const premisesClient = this.premisesClientFactory(token)
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

  async getUpdatePremises(token: string, id: string): Promise<UpdatePremises> {
    const premisesClient = this.premisesClientFactory(token)
    const premises = await premisesClient.find(id)

    return {
      ...premises,
      localAuthorityAreaId: premises.localAuthorityArea.id,
      characteristicIds: premises.characteristics.map(characteristic => characteristic.id),
      probationRegionId: premises.probationRegion.id,
    }
  }

  async create(token: string, newPremises: NewPremises): Promise<Premises> {
    const premisesClient = this.premisesClientFactory(token)
    const premises = await premisesClient.create(newPremises)

    return premises
  }

  async update(token: string, id: string, updatePremises: UpdatePremises): Promise<Premises> {
    const premisesClient = this.premisesClientFactory(token)
    const premises = await premisesClient.update(id, updatePremises)

    return premises
  }

  private async summaryListForPremises(premises: Premises): Promise<SummaryList> {
    return {
      rows: [
        {
          key: this.textValue('Address'),
          value: this.htmlValue(`${escape(premises.addressLine1)}<br />${escape(premises.postcode)}`),
        },
        {
          key: this.textValue('Local authority'),
          value: this.textValue(premises.localAuthorityArea.name),
        },
        {
          key: this.textValue('Probation region'),
          value: this.textValue(premises.probationRegion.name),
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
