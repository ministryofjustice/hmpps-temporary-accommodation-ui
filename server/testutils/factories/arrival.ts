import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Arrival } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<Arrival>(() => ({
  id: faker.datatype.uuid(),
  arrivalDate: DateFormats.formatApiDate(faker.date.soon()),
  bookingId: faker.datatype.uuid(),
  expectedDepartureDate: DateFormats.formatApiDate(faker.date.future()),
  notes: faker.lorem.sentence(),
  name: `${faker.name.firstName()} ${faker.name.lastName()}`,
  crn: faker.datatype.uuid(),
}))
