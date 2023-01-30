import type { Room, NewRoom } from '@approved-premises/api'
import RestClient, { CallConfig } from './restClient'
import config, { ApiConfig } from '../config'
import api from '../paths/api'
import { UpdateRoom } from '../@types/shared/models/UpdateRoom'

export default class RoomClient {
  restClient: RestClient

  constructor(callConfig: CallConfig) {
    this.restClient = new RestClient('bedspaceClient', config.apis.approvedPremises as ApiConfig, callConfig.token)
  }

  async all(premisesId: string): Promise<Array<Room>> {
    return (await this.restClient.get({ path: api.premises.rooms.index({ premisesId }) })) as Array<Room>
  }

  async find(premisesId: string, roomId: string): Promise<Room> {
    return (await this.restClient.get({ path: api.premises.rooms.show({ premisesId, roomId }) })) as Room
  }

  async create(premisesId: string, data: NewRoom): Promise<Room> {
    return (await this.restClient.post({ path: api.premises.rooms.create({ premisesId }), data })) as Room
  }

  async update(premisesId: string, roomId: string, data: UpdateRoom): Promise<Room> {
    return (await this.restClient.put({ path: api.premises.rooms.update({ premisesId, roomId }), data })) as Room
  }
}
