import type { Room, NewRoom } from '@approved-premises/api'
import RestClient from './restClient'
import config, { ApiConfig } from '../config'
import api from '../paths/api'

export default class RoomClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('bedspaceClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async create(premisesId: string, data: NewRoom): Promise<Room> {
    return (await this.restClient.post({ path: api.premises.rooms.create({ premisesId }), data })) as Room
  }
}
