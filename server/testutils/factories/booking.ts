import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Booking } from 'approved-premises'

export default Factory.define<Booking>(() => ({
  CRN: faker.datatype.uuid(),
  arrivalDate: faker.date.soon(),
  expectedDepartureDate: faker.date.future(),
  keyWorker: `${faker.name.firstName()} ${faker.name.lastName()}`,
  id: faker.datatype.uuid(),
}))
