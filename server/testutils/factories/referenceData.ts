import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { ReferenceData } from 'approved-premises'

export default Factory.define<ReferenceData>(() => ({
  id: faker.datatype.uuid(),
  name: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
  isActive: true,
}))
