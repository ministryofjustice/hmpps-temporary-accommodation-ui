import type {
  ActiveOffence,
  Adjudication,
  OASysSections,
  Person,
  PersonAcctAlert,
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

  async search(crn: string) {
    return this.restClient.get<Person>({
      path: `${paths.people.search({})}?crn=${normalise(crn)}`,
    })
  }

  async prisonCaseNotes(crn: string) {
    return this.restClient.get<Array<PrisonCaseNote>>({ path: paths.people.prisonCaseNotes({ crn: crn.trim() }) })
  }

  async adjudications(crn: string) {
    return this.restClient.get<Array<Adjudication>>({ path: paths.people.adjudications({ crn: crn.trim() }) })
  }

  async acctAlerts(crn: string) {
    return this.restClient.get<Array<PersonAcctAlert>>({ path: paths.people.acctAlerts({ crn }) })
  }

  async offences(crn: string) {
    return this.restClient.get<Array<ActiveOffence>>({ path: paths.people.offences({ crn: crn.trim() }) })
  }

  async oasysSections(crn: string, selectedSections?: Array<number>) {
    if (config.flags.oasysDisabled) {
      return oasysStubs as OASysSections
    }

    const path = appendQueryString(paths.people.oasys.sections({ crn: crn.trim() }), {
      'selected-sections': selectedSections,
    })

    return this.restClient.get<OASysSections>({ path })
  }
}
