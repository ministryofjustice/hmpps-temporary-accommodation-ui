import type { LostBed, NewLostBed } from '@approved-premises/api'
import { Request } from 'express'
import RestClient from './restClient'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'

export default class LostBedClient {
  restClient: RestClient

  constructor(req: Request) {
    this.restClient = new RestClient('lostBedClient', config.apis.approvedPremises as ApiConfig, req)
  }

  async create(premisesId: string, lostBed: NewLostBed): Promise<LostBed> {
    const response = await this.restClient.post({
      path: paths.premises.lostBeds.create({ premisesId }),
      data: lostBed,
    })

    return response as LostBed
  }
}
