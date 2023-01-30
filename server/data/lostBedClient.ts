import type { LostBed, NewLostBed } from '@approved-premises/api'
import RestClient, { CallConfig } from './restClient'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'

export default class LostBedClient {
  restClient: RestClient

  constructor(callConfig: CallConfig) {
    this.restClient = new RestClient('lostBedClient', config.apis.approvedPremises as ApiConfig, callConfig.token)
  }

  async create(premisesId: string, lostBed: NewLostBed): Promise<LostBed> {
    const response = await this.restClient.post({
      path: paths.premises.lostBeds.create({ premisesId }),
      data: lostBed,
    })

    return response as LostBed
  }
}
