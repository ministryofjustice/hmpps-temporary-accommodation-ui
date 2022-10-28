import type { Characteristic, Room, NewRoom } from '@approved-premises/api'
import { ReferenceDataClient, RestClientBuilder } from '../data'
import RoomClient from '../data/roomClient'

export default class BedspaceService {
  constructor(
    private readonly roomClientFactory: RestClientBuilder<RoomClient>,
    private readonly referenceDataClientFactory: RestClientBuilder<ReferenceDataClient>,
  ) {}

  async createRoom(token: string, premisesId: string, newRoom: NewRoom): Promise<Room> {
    const roomClient = this.roomClientFactory(token)
    const room = await roomClient.create(premisesId, newRoom)

    return room
  }

  async getRoomCharacteristics(token: string): Promise<Array<Characteristic>> {
    const referenceDataClient = this.referenceDataClientFactory(token)
    return (await referenceDataClient.getReferenceData<Characteristic>('characteristics'))
      .filter(characteristic => characteristic.modelScope === 'room' || characteristic.modelScope === '*')
      .sort((a, b) => a.name.localeCompare(b.name))
  }
}
