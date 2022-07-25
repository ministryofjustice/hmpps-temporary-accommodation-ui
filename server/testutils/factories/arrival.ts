import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Arrival } from 'approved-premises'

export default Factory.define<Arrival>(() => ({
  id: faker.datatype.uuid(),
  dateTime: faker.date.soon(),
  bookingId: faker.datatype.uuid(),
  expectedDeparture: faker.date.future(),
  notes: faker.lorem.sentence(),
}))
