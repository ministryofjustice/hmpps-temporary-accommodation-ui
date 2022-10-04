import type { Premises, TableRow, SummaryList } from 'approved-premises'
import type { RestClientBuilder, PremisesClient } from '../data'
import paths from '../paths/manage'

import { DateFormats } from '../utils/dateUtils'
import getDateRangesWithNegativeBeds, { NegativeDateRange } from '../utils/premisesUtils'

export default class PremisesService {
  constructor(private readonly premisesClientFactory: RestClientBuilder<PremisesClient>) {}

  async tableRows(token: string): Promise<Array<TableRow>> {
    const premisesClient = this.premisesClientFactory(token)
    const premises = await premisesClient.all()

    return premises
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((p: Premises) => {
        return [
          this.textValue(p.name),
          this.textValue(p.apCode),
          this.textValue(p.bedCount.toString()),
          this.htmlValue(
            `<a href="${paths.premises.show({ premisesId: p.id })}">View<span class="govuk-visually-hidden">about ${
              p.name
            }</span></a>`,
          ),
        ]
      })
  }

  async getPremisesDetails(token: string, id: string): Promise<{ name: string; summaryList: SummaryList }> {
    const premisesClient = this.premisesClientFactory(token)
    const premises = await premisesClient.find(id)
    const summaryList = await this.summaryListForPremises(premises)

    return { name: premises.name, summaryList }
  }

  async getOvercapacityMessage(token: string, premisesId: string): Promise<string[] | string> {
    const premisesClient = this.premisesClientFactory(token)
    const premisesDateCapacities = await premisesClient.capacity(premisesId)

    const overcapacityDateRanges = getDateRangesWithNegativeBeds(premisesDateCapacities)

    const overcapacityMessage = this.generateOvercapacityMessage(overcapacityDateRanges)

    return overcapacityMessage ? [overcapacityMessage] : ''
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

  async summaryListForPremises(premises: Premises): Promise<SummaryList> {
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

  private textValue(value: string) {
    return { text: value }
  }

  private htmlValue(value: string) {
    return { html: value }
  }
}
