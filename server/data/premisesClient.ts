import type { NewPremises, TemporaryAccommodationPremises as Premises, UpdatePremises } from '@approved-premises/api'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'
import RestClient, { CallConfig } from './restClient'

export default class PremisesClient {
  restClient: RestClient

  constructor(callConfig: CallConfig) {
    this.restClient = new RestClient('premisesClient', config.apis.approvedPremises as ApiConfig, callConfig)
  }

  async find(id: string) {
    return this.restClient.get<Premises>({
      path: paths.premises.show({ premisesId: id }),
    })
  }

  async create(data: NewPremises) {
    return this.restClient.post<Premises>({ path: paths.premises.create({}), data })
  }

  async update(id: string, data: UpdatePremises) {
    return this.restClient.put<Premises>({
      path: paths.premises.update({ premisesId: id }),
      data,
    })
  }
}
