import type {
  ActiveOffence,
  Adjudication,
  OASysSections,
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

    const person = await personClient.search(crn)
    return person
  }

  async getOffences(callConfig: CallConfig, crn: string): Promise<Array<ActiveOffence>> {
    const personClient = this.personClientFactory(callConfig)

    const offences = await personClient.offences(crn)
    return offences
  }

  async getPrisonCaseNotes(callConfig: CallConfig, crn: string): Promise<Array<PrisonCaseNote>> {
    const personClient = this.personClientFactory(callConfig)

    const prisonCaseNotes = await personClient.prisonCaseNotes(crn)

    return prisonCaseNotes
  }

  async getAdjudications(callConfig: CallConfig, crn: string): Promise<Array<Adjudication>> {
    const personClient = this.personClientFactory(callConfig)

    const adjudications = await personClient.adjudications(crn)

    return adjudications
  }

  async getAcctAlerts(callConfig: CallConfig, crn: string): Promise<Array<PersonAcctAlert>> {
    const personClient = this.personClientFactory(callConfig)

    const acctAlerts = await personClient.acctAlerts(crn)

    return acctAlerts
  }

  async getOasysSections(
    callConfig: CallConfig,
    crn: string,
    selectedSections: Array<number> = [],
  ): Promise<OASysSections> {
    const personClient = this.personClientFactory(callConfig)

    try {
      const oasysSections = await personClient.oasysSections(crn, selectedSections)

      return oasysSections
    } catch (e) {
      if (e?.data?.status === 404) {
        throw new OasysNotFoundError(`Oasys record not found for CRN: ${crn}`)
      }
      throw e
    }
  }
}
