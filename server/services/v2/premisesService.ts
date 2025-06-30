import type {
  Cas3BedspacePremisesSearchResult,
  Cas3PremisesSearchResult,
  Cas3PremisesSearchResults,
  Cas3PremisesStatus,
} from '@approved-premises/api'
import { TableRow } from '@approved-premises/ui'
import type { PremisesClientV2 as PremisesClient, RestClientBuilder } from '../../data'

import { CallConfig } from '../../data/restClient'
import paths from '../../paths/temporary-accommodation/manage'

export default class PremisesService {
  constructor(protected readonly premisesClientFactory: RestClientBuilder<PremisesClient>) {}

  async searchDataAndGenerateTableRows(
    callConfig: CallConfig,
    postcodeOrAddress: string | undefined,
    status: Cas3PremisesStatus = 'online',
  ): Promise<Cas3PremisesSearchResults & { tableRows: Array<TableRow> }> {
    const premisesClient = this.premisesClientFactory(callConfig)

    const premises = await premisesClient.search(postcodeOrAddress ?? '', status)

    return {
      ...premises,
      tableRows: this.tableRows(premises),
    }
  }

  tableRows(premises: Cas3PremisesSearchResults): Array<TableRow> {
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

  private bedspaceUrl(premisesId: string, bedspaceId: string): string {
    return paths.premises.v2.bedspaces.show({ premisesId, bedspaceId })
  }

  private formatBedspace(premisesId: string, bedspace: Cas3BedspacePremisesSearchResult): string {
    const archived =
      bedspace.status === 'archived' ? ` <strong class="govuk-tag govuk-tag--grey">Archived</strong>` : ''

    return `<a href="${this.bedspaceUrl(premisesId, bedspace.id)}">${bedspace.reference}</a>${archived}`
  }

  private formatBedspaces(premises: Cas3PremisesSearchResult): string {
    if (premises.bedspaces === undefined || premises.bedspaces.length === 0) {
      return `No bedspaces<br /><a href="#">Add a bedspace</a>`
    }

    return premises.bedspaces.map(bedspace => this.formatBedspace(premises.id, bedspace)).join('<br />')
  }
}
