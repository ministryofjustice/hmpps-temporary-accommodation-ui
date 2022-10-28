import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Characteristic } from '@approved-premises/api'

export default Factory.define<Characteristic>(() => ({
  id: faker.datatype.uuid(),
  name: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
  modelScope: faker.helpers.arrayElement(['room', '*']),
  serviceScope: 'temporary-accommodation',
}))
