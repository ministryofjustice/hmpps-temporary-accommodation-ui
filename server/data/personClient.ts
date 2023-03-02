import type { Response } from 'express'
import qs from 'qs'

import type {
  ActiveOffence,
  Adjudication,
  OASysSection,
  OASysSections,
  Person,
  PersonRisks,
  PrisonCaseNote,
} from '@approved-premises/api'

import config, { ApiConfig } from '../config'
import paths from '../paths/api'
import RestClient, { CallConfig } from './restClient'

import oasysStubs from './stubs/oasysStubs.json'

export default class PersonClient {
  restClient: RestClient

  constructor(callConfig: CallConfig) {
    this.restClient = new RestClient('personClient', config.apis.approvedPremises as ApiConfig, callConfig)
  }

  async search(crn: string): Promise<Person> {
    const response = await this.restClient.get({
      path: `${paths.people.search({})}?crn=${crn}`,
    })

    return response as Person
  }

  async risks(crn: string): Promise<PersonRisks> {
    const response = await this.restClient.get({
      path: paths.people.risks.show({ crn }),
    })

    return response as PersonRisks
  }

  async prisonCaseNotes(crn: string): Promise<Array<PrisonCaseNote>> {
    const response = await this.restClient.get({ path: paths.people.prisonCaseNotes({ crn }) })

    return response as Array<PrisonCaseNote>
  }

  async adjudications(crn: string): Promise<Array<Adjudication>> {
    const response = await this.restClient.get({ path: paths.people.adjudications({ crn }) })

    return response as Array<Adjudication>
  }

  async offences(crn: string): Promise<Array<ActiveOffence>> {
    const response = await this.restClient.get({ path: paths.people.offences({ crn }) })

    return response as Array<ActiveOffence>
  }

  async oasysSelections(crn: string): Promise<Array<OASysSection>> {
    const response = await this.restClient.get({ path: paths.people.oasys.selection({ crn }) })

    return response as Array<OASysSection>
  }

  async oasysSections(crn: string, selectedSections?: Array<number>): Promise<OASysSections> {
    let response: OASysSections

    if (config.flags.oasysDisabled) {
      response = oasysStubs as OASysSections
    } else {
      const queryString: string = qs.stringify(
        { 'selected-sections': selectedSections },
        { encode: false, indices: false },
      )

      const path = `${paths.people.oasys.sections({ crn })}${queryString ? `?${queryString}` : ''}`

      response = (await this.restClient.get({ path })) as OASysSections
    }

    return response as OASysSections
  }

  async document(crn: string, documentId: string, response: Response): Promise<void> {
    await this.restClient.pipe(response, documentId, { path: paths.people.documents({ crn, documentId }) })
  }
}
