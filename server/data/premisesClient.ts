import type { Premises } from 'approved-premises'
import RestClient from './restClient'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'

export default class PremisesClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('premisesClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async all(): Promise<Array<Premises>> {
    return (await this.restClient.get({ path: paths.premises.index({}) })) as Array<Premises>
  }

  async find(id: string): Promise<Premises> {
    return (await this.restClient.get({ path: paths.premises.show({ premisesId: id }) })) as Premises
  }
}
