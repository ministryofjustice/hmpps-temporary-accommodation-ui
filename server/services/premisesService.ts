import type { TableRow, SummaryList } from '@approved-premises/ui'
import type { StaffMember, NewPremises, Premises } from '@approved-premises/api'
import type { RestClientBuilder, PremisesClient } from '../data'
import apPaths from '../paths/manage'
import taPaths from '../paths/temporary-accommodation/manage'

import { DateFormats } from '../utils/dateUtils'
import getDateRangesWithNegativeBeds, { NegativeDateRange } from '../utils/premisesUtils'
import { escape, formatLines } from '../utils/viewUtils'

export default class PremisesService {
  constructor(private readonly premisesClientFactory: RestClientBuilder<PremisesClient>) {}

  async getStaffMembers(token: string, premisesId: string): Promise<Array<StaffMember>> {
    const premisesClient = this.premisesClientFactory(token)

    const staffMembers = await premisesClient.getStaffMembers(premisesId)

    return staffMembers
  }

  async approvedPremisesTableRows(token: string): Promise<Array<TableRow>> {
    const premisesClient = this.premisesClientFactory(token)
    const premises = await premisesClient.all('approved-premises')

    return premises
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((p: Premises) => {
        return [
          this.textValue(p.name),
          this.textValue(p.apCode),
          this.textValue(p.bedCount.toString()),
          this.htmlValue(
            `<a href="${apPaths.premises.show({ premisesId: p.id })}">View<span class="govuk-visually-hidden">about ${
              p.name
            }</span></a>`,
          ),
        ]
      })
  }

  async temporaryAccommodationTableRows(token: string): Promise<Array<TableRow>> {
    const premisesClient = this.premisesClientFactory(token)
    const premises = await premisesClient.all('temporary-accommodation')

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
            `<a href="${taPaths.premises.show({
              premisesId: entry.premises.id,
            })}">Manage<span class="govuk-visually-hidden"> ${entry.shortAddress}</span></a>`,
          ),
        ]
      })
  }

  async getApprovedPremisesPremisesDetails(
    token: string,
    id: string,
  ): Promise<{ name: string; summaryList: SummaryList }> {
    const premisesClient = this.premisesClientFactory(token)
    const premises = await premisesClient.find(id)
    const summaryList = await this.approvedPremisesSummaryListForPremises(premises)

    return { name: premises.name, summaryList }
  }

  async getTemporaryAccommodationPremisesDetails(
    token: string,
    id: string,
  ): Promise<{ premises: Premises; summaryList: SummaryList }> {
    const premisesClient = this.premisesClientFactory(token)
    const premises = await premisesClient.find(id)
    const summaryList = await this.temporaryAccommodationSummaryListForPremises(premises)

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
    const premises = await premisesClient.all('approved-premises')

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

  async create(token: string, newPremises: NewPremises): Promise<Premises> {
    const premisesClient = this.premisesClientFactory(token)
    const premises = await premisesClient.create(newPremises)

    return premises
  }

  private async approvedPremisesSummaryListForPremises(premises: Premises): Promise<SummaryList> {
    return {
      rows: [
        {
          key: this.textValue('Code'),
          value: this.textValue(premises.apCode),
        },
        {
          key: this.textValue('Postcode'),
          value: this.textValue(premises.postcode),
        },
        {
          key: this.textValue('Number of Beds'),
          value: this.textValue(premises.bedCount.toString()),
        },
        {
          key: this.textValue('Available Beds'),
          value: this.textValue(premises.availableBedsForToday.toString()),
        },
      ],
    }
  }

  private async temporaryAccommodationSummaryListForPremises(premises: Premises): Promise<SummaryList> {
    return {
      rows: [
        {
          key: this.textValue('Property name'),
          value: this.textValue(premises.name),
        },
        {
          key: this.textValue('Address'),
          value: this.htmlValue(`${escape(premises.addressLine1)}<br />${escape(premises.postcode)}`),
        },
        {
          key: this.textValue('PDU'),
          value: this.textValue(''),
        },
        {
          key: this.textValue('Local authority'),
          value: this.textValue(premises.localAuthorityArea.name),
        },
        {
          key: this.textValue('Occupancy'),
          value: this.textValue(''),
        },
        {
          key: this.textValue('Attributes'),
          value: this.textValue(''),
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
