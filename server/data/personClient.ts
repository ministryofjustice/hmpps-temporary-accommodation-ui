import type { Response } from 'express'

import type {
  ActiveOffence,
  Adjudication,
  OASysSection,
  OASysSections,
  Person,
  PersonAcctAlert,
  PersonRisks,
  PrisonCaseNote,
} from '@approved-premises/api'

import config, { ApiConfig } from '../config'
import paths from '../paths/api'
import RestClient, { CallConfig } from './restClient'

import { appendQueryString, normalise } from '../utils/utils'
import oasysStubs from './stubs/oasysStubs.json'

export default class PersonClient {
  restClient: RestClient

  constructor(callConfig: CallConfig) {
    this.restClient = new RestClient('personClient', config.apis.approvedPremises as ApiConfig, callConfig)
  }

  async search(crn: string): Promise<Person> {
    const response = await this.restClient.get({
      path: `${paths.people.search({})}?crn=${normalise(crn)}`,
    })

    return response as Person
  }

  async risks(crn: string): Promise<PersonRisks> {
    const response = await this.restClient.get({
      path: paths.people.risks.show({ crn: crn.trim() }),
    })

    return response as PersonRisks
  }

  async prisonCaseNotes(crn: string): Promise<Array<PrisonCaseNote>> {
    const response = await this.restClient.get({ path: paths.people.prisonCaseNotes({ crn: crn.trim() }) })

    return response as Array<PrisonCaseNote>
  }

  async adjudications(crn: string): Promise<Array<Adjudication>> {
    const response = await this.restClient.get({ path: paths.people.adjudications({ crn: crn.trim() }) })

    return response as Array<Adjudication>
  }

  async acctAlerts(crn: string): Promise<Array<PersonAcctAlert>> {
    const response = await this.restClient.get({ path: paths.people.acctAlerts({ crn }) })

    return response as Array<PersonAcctAlert>
  }

  async offences(crn: string): Promise<Array<ActiveOffence>> {
    const response = await this.restClient.get({ path: paths.people.offences({ crn: crn.trim() }) })

    return response as Array<ActiveOffence>
  }

  async oasysSelections(crn: string): Promise<Array<OASysSection>> {
    const response = await this.restClient.get({ path: paths.people.oasys.selection({ crn: crn.trim() }) })

    return response as Array<OASysSection>
  }

  async oasysSections(crn: string, selectedSections?: Array<number>): Promise<OASysSections> {
    let response: OASysSections

    if (config.flags.oasysDisabled) {
      response = oasysStubs as OASysSections
    } else {
      const path = appendQueryString(paths.people.oasys.sections({ crn: crn.trim() }), {
        'selected-sections': selectedSections,
      })

      response = (await this.restClient.get({ path })) as OASysSections
    }

    return response as OASysSections
  }

  async document(crn: string, documentId: string, response: Response): Promise<void> {
    await this.restClient.pipe(response, { path: paths.people.documents({ crn: crn.trim(), documentId }) })
  }
}
