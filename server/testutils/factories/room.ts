import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import { Room } from '@approved-premises/api'
import { unique } from '../../utils/utils'
import bedFactory from './bed'
import referenceDataFactory from './referenceData'

export default Factory.define<Room>(() => ({
  id: faker.datatype.uuid(),
  name: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
  characteristics: unique(
    referenceDataFactory.characteristic('room').buildList(faker.datatype.number({ min: 1, max: 5 })),
  ),
  notes: faker.lorem.lines(),
  beds: [bedFactory.build()],
}))
