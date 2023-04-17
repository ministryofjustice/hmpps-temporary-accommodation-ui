import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import { Room } from '@approved-premises/api'
import { ReferenceData } from '../../@types/ui'
import { unique } from '../../utils/utils'
import bedFactory from './bed'
import characteristicFactory from './characteristic'
import referenceDataFactory from './referenceData'

class RoomFactory extends Factory<Room> {
  /* istanbul ignore next */
  forEnvironment(characteristics: ReferenceData[]) {
    return this.params({
      characteristics: faker.helpers
        .arrayElements(characteristics, faker.datatype.number({ min: 1, max: 5 }))
        .map(characteristic =>
          characteristicFactory.build({
            ...characteristic,
            modelScope: 'room',
          }),
        ),
    })
  }
}

export default RoomFactory.define(() => ({
  id: faker.datatype.uuid(),
  name: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
  characteristics: unique(
    referenceDataFactory.characteristic('room').buildList(faker.datatype.number({ min: 1, max: 5 })),
  ),
  notes: faker.lorem.lines(),
  beds: [bedFactory.build()],
}))
