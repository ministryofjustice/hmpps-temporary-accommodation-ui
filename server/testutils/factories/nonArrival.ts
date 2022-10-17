import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Nonarrival } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<Nonarrival>(() => ({
  id: faker.datatype.uuid(),
  bookingId: faker.datatype.uuid(),
  notes: faker.lorem.sentence(),
  reason: faker.lorem.word(),
  date: DateFormats.formatApiDate(faker.date.soon()),
}))
