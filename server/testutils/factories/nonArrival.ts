import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { NonArrival } from 'approved-premises'

export default Factory.define<NonArrival>(() => ({
  id: faker.datatype.uuid(),
  bookingId: faker.datatype.uuid(),
  notes: faker.lorem.sentence(),
  reason: faker.lorem.word(),
  date: faker.date.soon().toISOString(),
}))
