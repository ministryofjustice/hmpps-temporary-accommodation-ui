import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import { Bed, Room } from '@approved-premises/api'
import referenceDataFactory from './referenceData'
import { unique } from '../../utils/utils'

export default Factory.define<Room>(() => ({
  id: faker.datatype.uuid(),
  name: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
  characteristics: unique(
    referenceDataFactory.characteristic('room').buildList(faker.datatype.number({ min: 1, max: 5 })),
  ),
  notes: faker.lorem.lines(),
  beds: [bedFactory.build()],
}))

const bedFactory = Factory.define<Bed>(() => ({
  id: faker.datatype.uuid(),
  name: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
}))
