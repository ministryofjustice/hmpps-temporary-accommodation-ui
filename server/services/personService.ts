import type { PersonRisksUI } from '@approved-premises/ui'
import type { Person } from '@approved-premises/api'
import { Request } from 'express'
import type { RestClientBuilder, PersonClient } from '../data'

import { mapApiPersonRisksForUi } from '../utils/utils'

export default class PersonService {
  constructor(private readonly personClientFactory: RestClientBuilder<PersonClient>) {}

  async findByCrn(req: Request, crn: string): Promise<Person> {
    const personClient = this.personClientFactory(req)

    const person = await personClient.search(crn)
    return person
  }

  async getPersonRisks(req: Request, crn: string): Promise<PersonRisksUI> {
    const personClient = this.personClientFactory(req)

    const risks = await personClient.risks(crn)

    return mapApiPersonRisksForUi(risks)
  }
}
