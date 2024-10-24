import { Factory } from 'fishery'
import { fakerEN_GB as faker } from '@faker-js/faker'
import type { Room, UpdateRoom } from '@approved-premises/api'
import referenceDataFactory from './referenceData'
import { unique } from '../../utils/utils'

class UpdateRoomFactory extends Factory<UpdateRoom> {
  /* istanbul ignore next */
  fromRoom(room: Room) {
    return this.params({
      ...room,
      characteristicIds: room.characteristics.map(characteristic => characteristic.id),
    })
  }
}

export default UpdateRoomFactory.define(() => ({
  characteristicIds: unique([referenceDataFactory.characteristic('room').build()]).map(
    characteristic => characteristic.id,
  ),
  notes: faker.lorem.lines(),
}))
