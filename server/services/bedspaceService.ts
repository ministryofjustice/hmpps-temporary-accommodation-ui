import type { Characteristic, Room, NewRoom, UpdateRoom } from '@approved-premises/api'
import { SummaryList } from '../@types/ui'
import { ReferenceDataClient, RestClientBuilder } from '../data'
import RoomClient from '../data/roomClient'
import { formatCharacteristics, filterCharacteristics } from '../utils/characteristicUtils'
import { formatLines } from '../utils/viewUtils'

export type BedspaceReferenceData = {
  characteristics: Array<Characteristic>
}

export default class BedspaceService {
  constructor(
    private readonly roomClientFactory: RestClientBuilder<RoomClient>,
    private readonly referenceDataClientFactory: RestClientBuilder<ReferenceDataClient>,
  ) {}

  async getRoom(token: string, premisesId: string, roomId: string): Promise<Room> {
    const roomClient = this.roomClientFactory(token)
    const room = await roomClient.find(premisesId, roomId)

    return room
  }

  async getBedspaceDetails(
    token: string,
    premisesId: string,
  ): Promise<Array<{ room: Room; summaryList: SummaryList }>> {
    const roomClient = this.roomClientFactory(token)
    const rooms = await roomClient.all(premisesId)

    return rooms
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(room => ({
        room,
        summaryList: this.summaryListForRoom(room),
      }))
  }

  async getSingleBedspaceDetails(
    token: string,
    premisesId: string,
    roomId: string,
  ): Promise<{ room: Room; summaryList: SummaryList }> {
    const roomClient = this.roomClientFactory(token)
    const room = await roomClient.find(premisesId, roomId)

    return {
      room,
      summaryList: this.summaryListForRoom(room),
    }
  }

  async getUpdateRoom(token: string, premisesId: string, roomId: string): Promise<UpdateRoom> {
    const roomClient = this.roomClientFactory(token)
    const room = await roomClient.find(premisesId, roomId)

    return {
      ...room,
      characteristicIds: room.characteristics.map(characteristic => characteristic.id),
    }
  }

  async createRoom(token: string, premisesId: string, newRoom: NewRoom): Promise<Room> {
    const roomClient = this.roomClientFactory(token)
    const room = await roomClient.create(premisesId, newRoom)

    return room
  }

  async updateRoom(token: string, premisesId: string, roomId: string, updateRoom: UpdateRoom): Promise<Room> {
    const roomClient = this.roomClientFactory(token)
    const room = await roomClient.update(premisesId, roomId, updateRoom)

    return room
  }

  async getReferenceData(token: string): Promise<BedspaceReferenceData> {
    const referenceDataClient = this.referenceDataClientFactory(token)

    const characteristics = filterCharacteristics(
      await referenceDataClient.getReferenceData<Characteristic>('characteristics'),
      'room',
    ).sort((a, b) => a.name.localeCompare(b.name))

    return { characteristics }
  }

  private summaryListForRoom(room: Room): SummaryList {
    return {
      rows: [
        {
          key: this.textValue('Attributes'),
          value: formatCharacteristics(room.characteristics),
        },
        {
          key: this.textValue('Notes'),
          value: this.htmlValue(formatLines(room.notes)),
        },
      ],
    }
  }

  private textValue(value: string) {
    return { text: value }
  }

  private htmlValue(value: string) {
    return { html: value }
  }
}
