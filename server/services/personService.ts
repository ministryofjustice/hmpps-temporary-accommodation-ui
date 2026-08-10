import type {
  ActiveOffence,
  Adjudication,
  Cas3OASysGroup,
  Person,
  PersonAcctAlert,
  PrisonCaseNote,
} from '@approved-premises/api'
import type { PersonClient, RestClientBuilder } from '../data'

import { CallConfig } from '../data/restClient'

export class OasysNotFoundError extends Error {}

export default class PersonService {
  constructor(private readonly personClientFactory: RestClientBuilder<PersonClient>) {}

  async findByCrn(callConfig: CallConfig, crn: string): Promise<Person> {
    const personClient = this.personClientFactory(callConfig)

    return personClient.search(crn)
  }

  async getOffences(callConfig: CallConfig, crn: string): Promise<Array<ActiveOffence>> {
    const personClient = this.personClientFactory(callConfig)

    return personClient.offences(crn)
  }

  async getPrisonCaseNotes(callConfig: CallConfig, crn: string): Promise<Array<PrisonCaseNote>> {
    const personClient = this.personClientFactory(callConfig)

    return personClient.prisonCaseNotes(crn)
  }

  async getAdjudications(callConfig: CallConfig, crn: string): Promise<Array<Adjudication>> {
    const personClient = this.personClientFactory(callConfig)

    return personClient.adjudications(crn)
  }

  async getAcctAlerts(callConfig: CallConfig, crn: string): Promise<Array<PersonAcctAlert>> {
    const personClient = this.personClientFactory(callConfig)

    return personClient.acctAlerts(crn)
  }

  async getOasysRiskManagement(callConfig: CallConfig, crn: string): Promise<Cas3OASysGroup> {
    const personClient = this.personClientFactory(callConfig)

    try {
      return personClient.oasysRiskManagement(crn)
    } catch (e) {
      if (e?.data?.status === 404) {
        throw new OasysNotFoundError(`Oasys record not found for CRN: ${crn}`)
      }
      throw e
    }
  }
}
