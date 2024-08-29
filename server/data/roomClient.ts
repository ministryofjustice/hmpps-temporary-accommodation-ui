import type { NewRoom, Room } from '@approved-premises/api'
import RestClient, { CallConfig } from './restClient'
import config, { ApiConfig } from '../config'
import api from '../paths/api'
import { UpdateRoom } from '../@types/shared/models/UpdateRoom'

export default class RoomClient {
  restClient: RestClient

  constructor(callConfig: CallConfig) {
    this.restClient = new RestClient('bedspaceClient', config.apis.approvedPremises as ApiConfig, callConfig)
  }

  async all(premisesId: string) {
    return this.restClient.get<Array<Room>>({ path: api.premises.rooms.index({ premisesId }) })
  }

  async find(premisesId: string, roomId: string) {
    return this.restClient.get<Room>({ path: api.premises.rooms.show({ premisesId, roomId }) })
  }

  async create(premisesId: string, data: NewRoom) {
    return this.restClient.post<Room>({ path: api.premises.rooms.create({ premisesId }), data })
  }

  async update(premisesId: string, roomId: string, data: UpdateRoom) {
    return this.restClient.put<Room>({ path: api.premises.rooms.update({ premisesId, roomId }), data })
  }
}
