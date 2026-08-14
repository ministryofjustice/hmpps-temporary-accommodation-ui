import type {
  ActiveOffence,
  Adjudication,
  Cas3OASysAssessmentSuitabilityStrategyDto,
  Cas3OASysGroup,
  Person,
  PersonAcctAlert,
  PrisonCaseNote,
} from '@approved-premises/api'

import config, { ApiConfig } from '../config'
import paths from '../paths/api'
import RestClient, { CallConfig } from './restClient'

import { createQueryString, normalise } from '../utils/utils'
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

  async oasysRiskManagement(crn: string, suitabilityStrategy: Cas3OASysAssessmentSuitabilityStrategyDto) {
    if (config.flags.oasysDisabled) {
      return oasysStubs as Cas3OASysGroup
    }

    const path = paths.people.oasys.riskManagement({ crn: crn.trim() })
    const queryString = createQueryString({ suitabilityStrategy })

    return this.restClient.get<Cas3OASysGroup>({ path: `${path}?${queryString}` })
  }
}
