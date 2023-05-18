import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import type { Characteristic } from '@approved-premises/api'

export default Factory.define<Characteristic>(() => ({
  id: faker.string.uuid(),
  name: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
  modelScope: faker.helpers.arrayElement(['room', '*']),
  serviceScope: 'temporary-accommodation',
}))
