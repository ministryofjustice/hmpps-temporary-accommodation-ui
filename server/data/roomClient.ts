import type { Room, NewRoom } from '@approved-premises/api'
import RestClient from './restClient'
import config, { ApiConfig } from '../config'
import api from '../paths/api'

export default class RoomClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('bedspaceClient', config.apis.approvedPremises as ApiConfig, token)
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
}
