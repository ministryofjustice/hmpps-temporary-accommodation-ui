import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Arrival } from 'approved-premises'

export default Factory.define<Arrival>(() => ({
  id: faker.datatype.uuid(),
  date: faker.date.soon().toISOString(),
  bookingId: faker.datatype.uuid(),
  expectedDepartureDate: faker.date.future().toISOString(),
  notes: faker.lorem.sentence(),
  name: `${faker.name.firstName()} ${faker.name.lastName()}`,
  crn: faker.datatype.uuid(),
}))
