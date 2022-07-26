import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Booking } from 'approved-premises'

export default Factory.define<Booking>(() => ({
  CRN: faker.datatype.uuid(),
  arrivalDate: faker.date.soon().toISOString(),
  expectedDepartureDate: faker.date.future().toISOString(),
  keyWorker: `${faker.name.firstName()} ${faker.name.lastName()}`,
  name: `${faker.name.firstName()} ${faker.name.lastName()}`,
  id: faker.datatype.uuid(),
}))
