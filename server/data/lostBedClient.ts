import type {
  TemporaryAccommodationLostBed as LostBed,
  NewTemporaryAccommodationLostBed as NewLostBed,
} from '@approved-premises/api'
import RestClient, { CallConfig } from './restClient'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'

export default class LostBedClient {
  restClient: RestClient

  constructor(callConfig: CallConfig) {
    this.restClient = new RestClient('lostBedClient', config.apis.approvedPremises as ApiConfig, callConfig)
  }

  async create(premisesId: string, lostBed: NewLostBed): Promise<LostBed> {
    const response = await this.restClient.post({
      path: paths.premises.lostBeds.create({ premisesId }),
      data: lostBed,
    })

    return response as LostBed
  }

  async find(premisesId: string, lostBedId: string): Promise<LostBed> {
    return (await this.restClient.get({
      path: paths.premises.lostBeds.show({ premisesId, lostBedId }),
    })) as LostBed
  }

  async allLostBedsForPremisesId(premisesId: string): Promise<Array<LostBed>> {
    return (await this.restClient.get({
      path: paths.premises.lostBeds.index({ premisesId }),
    })) as Array<LostBed>
  }
}
