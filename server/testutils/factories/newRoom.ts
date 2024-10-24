import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import type { NewRoom, Room } from '@approved-premises/api'
import { addYears } from 'date-fns'
import { unique } from '../../utils/utils'
import referenceDataFactory from './referenceData'
import { DateFormats } from '../../utils/dateUtils'

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
  bedEndDate: DateFormats.dateObjToIsoDate(addYears(faker.date.future({ years: 1 }), 2)),
}))
