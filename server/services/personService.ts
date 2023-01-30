import type { PersonRisksUI } from '@approved-premises/ui'
import type { Person } from '@approved-premises/api'
import type { RestClientBuilder, PersonClient } from '../data'

import { mapApiPersonRisksForUi } from '../utils/utils'
import { CallConfig } from '../data/restClient'

export default class PersonService {
  constructor(private readonly personClientFactory: RestClientBuilder<PersonClient>) {}

  async findByCrn(callConfig: CallConfig, crn: string): Promise<Person> {
    const personClient = this.personClientFactory(callConfig)

    const person = await personClient.search(crn)
    return person
  }

  async getPersonRisks(callConfig: CallConfig, crn: string): Promise<PersonRisksUI> {
    const personClient = this.personClientFactory(callConfig)

    const risks = await personClient.risks(crn)

    return mapApiPersonRisksForUi(risks)
  }
}
