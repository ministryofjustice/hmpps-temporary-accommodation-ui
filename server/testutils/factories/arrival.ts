import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Arrival } from 'approved-premises'
import { DateFormats } from '../../utils/dateFormats'

export default Factory.define<Arrival>(() => ({
  id: faker.datatype.uuid(),
  date: DateFormats.formatApiDate(faker.date.soon()),
  bookingId: faker.datatype.uuid(),
  expectedDepartureDate: DateFormats.formatApiDate(faker.date.future()),
  notes: faker.lorem.sentence(),
  name: `${faker.name.firstName()} ${faker.name.lastName()}`,
  crn: faker.datatype.uuid(),
}))
