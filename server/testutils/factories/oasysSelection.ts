import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { OASysSection } from '@approved-premises/api'

export default Factory.define<OASysSection>(() => ({
  section: faker.datatype.number({ min: 1, max: 20 }),
  name: faker.helpers.arrayElement([
    'accommodation',
    'relationships',
    'emotional',
    'thinking',
    'ete',
    'lifestyle',
    'health',
    'attitudes',
  ]),
  linkedToHarm: faker.datatype.boolean(),
  linkedToReOffending: faker.datatype.boolean(),
}))
