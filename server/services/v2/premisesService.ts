import type { Cas3BedspacePremisesSearchResult, Cas3PremisesSearchResult } from '@approved-premises/api'
import { PremisesSearchParameters, TableRow } from '@approved-premises/ui'
import type { PremisesClientV2 as PremisesClient, RestClientBuilder } from '../../data'

import { CallConfig } from '../../data/restClient'

export default class PremisesService {
  constructor(protected readonly premisesClientFactory: RestClientBuilder<PremisesClient>) {}

  async tableRows(callConfig: CallConfig, params: PremisesSearchParameters): Promise<Array<TableRow>> {
    const premisesClient = this.premisesClientFactory(callConfig)

    const premises = await premisesClient.search(params.postcodeOrAddress ?? '', 'online')

    return premises.results === undefined
      ? []
      : premises.results.map(entry => {
          return [
            this.htmlValue(this.formatAddress(entry)),
            this.htmlValue(this.formatBedspaces(entry)),
            this.textValue(entry.pdu),
            this.htmlValue(`<a href="#">Manage</a>`),
          ]
        })
  }

  private textValue(value: string) {
    return { text: value }
  }

  private htmlValue(value: string) {
    return { html: value }
  }

  private formatAddress(premises: Cas3PremisesSearchResult): string {
    return [premises.addressLine1, premises.addressLine2, premises.town, premises.postcode]
      .filter(line => line !== undefined && line !== null)
      .map(line => line.trim())
      .filter(line => line !== '')
      .join('<br />')
  }

  private formatBedspace(bedspace: Cas3BedspacePremisesSearchResult): string {
    const archived =
      bedspace.status === 'archived' ? ` <strong class="govuk-tag govuk-tag--grey">Archived</strong>` : ''

    return `<a href="#">${bedspace.reference}</a>${archived}`
  }

  private formatBedspaces(premises: Cas3PremisesSearchResult): string {
    if (premises.bedspaces === undefined || premises.bedspaces.length === 0) {
      return `No bedspaces<br /><a href="#">Add a bedspace</a>`
    }

    return premises.bedspaces.map(this.formatBedspace).join('<br />')
  }
}
