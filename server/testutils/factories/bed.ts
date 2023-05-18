import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import { Bed } from '@approved-premises/api'

export default Factory.define<Bed>(() => ({
  id: faker.string.uuid(),
  name: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
}))
