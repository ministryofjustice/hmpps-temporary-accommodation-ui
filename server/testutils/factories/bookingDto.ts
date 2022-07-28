import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { BookingDto } from 'approved-premises'

export default Factory.define<BookingDto>(() => ({
  CRN: faker.datatype.uuid(),
  name: `${faker.name.firstName()} ${faker.name.lastName()}`,
  arrivalDate: faker.date.soon().toISOString(),
  expectedDepartureDate: faker.date.future().toISOString(),
  keyWorker: `${faker.name.firstName()} ${faker.name.lastName()}`,
  id: faker.datatype.uuid(),
}))
