import type { Person } from 'approved-premises'
import RestClient from './restClient'
import config, { ApiConfig } from '../config'

export default class PersonClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('personClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async search(crn: string): Promise<Person> {
    const response = await this.restClient.post({
      path: `/people/search`,
      data: { crn },
    })

    return response as Person
  }
}
