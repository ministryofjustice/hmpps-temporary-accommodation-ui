import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'
import type { NewRoom } from '@approved-premises/api'
import referenceDataFactory from './referenceData'
import { unique } from '../../utils/utils'

export default Factory.define<NewRoom>(() => ({
  name: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
  characteristicIds: unique([referenceDataFactory.characteristic('room').build()]).map(
    characteristic => characteristic.id,
  ),
  notes: faker.lorem.lines(),
}))
