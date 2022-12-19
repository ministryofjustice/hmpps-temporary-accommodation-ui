import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Arrival } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<Arrival>(() => ({
  arrivalDate: DateFormats.formatApiDate(faker.date.soon()),
  bookingId: faker.datatype.uuid(),
  expectedDepartureDate: DateFormats.formatApiDate(faker.date.future()),
  notes: faker.lorem.sentence(),
  createdAt: DateFormats.formatApiDate(faker.date.past()),
}))
