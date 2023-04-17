import type { NewRoom, Room } from '@approved-premises/api'
import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'
import { unique } from '../../utils/utils'
import referenceDataFactory from './referenceData'

class NewRoomFactory extends Factory<NewRoom> {
  /* istanbul ignore next */
  fromRoom(room: Room) {
    return this.params({
      ...room,
      characteristicIds: room.characteristics.map(characteristic => characteristic.id),
    })
  }
}

export default NewRoomFactory.define(() => ({
  name: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
  characteristicIds: unique([referenceDataFactory.characteristic('room').build()]).map(
    characteristic => characteristic.id,
  ),
  notes: faker.lorem.lines(),
}))
