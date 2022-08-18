import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { BookingDto } from 'approved-premises'

export default Factory.define<BookingDto>(() => ({
  crn: faker.datatype.uuid(),
  name: `${faker.name.firstName()} ${faker.name.lastName()}`,
  expectedArrivalDate: faker.date.soon().toISOString(),
  expectedDepartureDate: faker.date.future().toISOString(),
  keyWorkerId: faker.datatype.uuid(),
  id: faker.datatype.uuid(),
}))
