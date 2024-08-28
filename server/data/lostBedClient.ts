import type {
  LostBed,
  LostBedCancellation,
  NewLostBed,
  NewLostBedCancellation,
  UpdateLostBed,
} from '@approved-premises/api'
import RestClient, { CallConfig } from './restClient'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'

export default class LostBedClient {
  restClient: RestClient

  constructor(callConfig: CallConfig) {
    this.restClient = new RestClient('lostBedClient', config.apis.approvedPremises as ApiConfig, callConfig)
  }

  async create(premisesId: string, lostBed: NewLostBed) {
    return this.restClient.post<LostBed>({
      path: paths.premises.lostBeds.create({ premisesId }),
      data: lostBed,
    })
  }

  async find(premisesId: string, lostBedId: string) {
    return this.restClient.get<LostBed>({
      path: paths.premises.lostBeds.show({ premisesId, lostBedId }),
    })
  }

  async update(premisesId: string, lostBedId: string, data: UpdateLostBed) {
    return this.restClient.put<LostBed>({
      path: paths.premises.lostBeds.update({ premisesId, lostBedId }),
      data,
    })
  }

  async allLostBedsForPremisesId(premisesId: string) {
    return this.restClient.get<Array<LostBed>>({
      path: paths.premises.lostBeds.index({ premisesId }),
    })
  }

  async cancel(premisesId: string, lostBedId: string, data: NewLostBedCancellation) {
    return this.restClient.post<LostBedCancellation>({
      path: paths.premises.lostBeds.cancel({ premisesId, lostBedId }),
      data,
    })
  }
}
