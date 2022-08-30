import type { LostBed, NewLostBed } from 'approved-premises'
import RestClient from './restClient'
import config, { ApiConfig } from '../config'

export default class LostBedClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('lostBedClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async create(premisesId: string, lostBed: NewLostBed): Promise<LostBed> {
    const response = await this.restClient.post({
      path: `/premises/${premisesId}/lostBeds`,
      data: lostBed,
    })

    return response as LostBed
  }
}
