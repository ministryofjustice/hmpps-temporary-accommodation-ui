import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { PremisesCapacityItem } from 'approved-premises'

export default Factory.define<PremisesCapacityItem>(() => ({
  availableBeds: faker.datatype.number({ min: -1, max: 2 }),
  date: faker.date.soon().toISOString(),
}))
