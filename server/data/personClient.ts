import type { Person, PersonRisks } from '@approved-premises/api'
import { Request } from 'express'
import RestClient from './restClient'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'

export default class PersonClient {
  restClient: RestClient

  constructor(req: Request) {
    this.restClient = new RestClient('personClient', config.apis.approvedPremises as ApiConfig, req)
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
