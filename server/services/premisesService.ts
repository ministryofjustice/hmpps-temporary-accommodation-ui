import type { Premises, TableRow, SummaryList } from 'approved-premises'
import type { RestClientBuilder, PremisesClient } from '../data'

export default class PremisesService {
  // TODO: We need to do some more work on authentication to work
  // out how to get this token, so let's stub for now
  token = 'FAKE_TOKEN'

  constructor(private readonly premisesClientFactory: RestClientBuilder<PremisesClient>) {}

  async tableRows(): Promise<Array<TableRow>> {
    const premisesClient = this.premisesClientFactory(this.token)
    const premises = await premisesClient.getAllPremises()

    return premises
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((p: Premises) => {
        return [
          this.textValue(p.name),
          this.textValue(p.apCode),
          this.textValue(p.bedCount.toString()),
          this.htmlValue(
            `<a href="/premises/${p.id}">View<span class="govuk-visually-hidden">about ${p.name}</span></a>`,
          ),
        ]
      })
  }

  async getPremisesDetails(id: string): Promise<{ name: string; summaryList: SummaryList }> {
    const premisesClient = this.premisesClientFactory(this.token)
    const premises = await premisesClient.getPremises(id)
    const summaryList = await this.summaryListForPremises(premises)

    return { name: premises.name, summaryList }
  }

  async getPremisesSelectList(): Promise<Array<{ text: string; value: string }>> {
    const premisesClient = this.premisesClientFactory(this.token)
    const premises = await premisesClient.getAllPremises()

    return premises
      .map(p => {
        return { text: `${p.name}`, value: `${p.name}` }
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
