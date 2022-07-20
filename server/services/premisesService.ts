import type { Premises, TableRow } from 'approved-premises'
import type { RestClientBuilder, PremisesClient } from '../data'

export default class PremisesService {
  constructor(private readonly premisesClientFactory: RestClientBuilder<PremisesClient>) {}

  async tableRows(): Promise<Array<TableRow>> {
    // TODO: We need to do some more work on authentication to work
    // out how to get this token, so let's stub for now
    const token = 'FAKE_TOKEN'
    const premisesClient = this.premisesClientFactory(token)
    const premises = await premisesClient.getAllPremises()

    return premises
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((p: Premises) => {
        return [
          {
            text: p.name,
          },
          {
            text: p.apCode,
          },
          {
            text: p.bedCount.toString(),
          },
          {
            html: `<a href="/premises/${p.id}">View<span class="govuk-visually-hidden">about ${p.name}</span></a>`,
          },
        ]
      })
  }
}
