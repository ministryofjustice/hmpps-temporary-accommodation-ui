import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Confirmation } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<Confirmation>(() => ({
  id: faker.datatype.uuid(),
  bookingId: faker.datatype.uuid(),
  dateTime: DateFormats.formatApiDate(faker.date.past()),
  notes: faker.lorem.sentence(),
}))
