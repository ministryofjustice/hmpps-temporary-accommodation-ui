import type { Person, PersonRisks } from '@approved-premises/api'
import RestClient, { CallConfig } from './restClient'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'

export default class PersonClient {
  restClient: RestClient

  constructor(callConfig: CallConfig) {
    this.restClient = new RestClient('personClient', config.apis.approvedPremises as ApiConfig, callConfig.token)
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
}
