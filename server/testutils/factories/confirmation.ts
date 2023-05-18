import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import type { Confirmation } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<Confirmation>(() => ({
  id: faker.string.uuid(),
  bookingId: faker.string.uuid(),
  dateTime: DateFormats.dateObjToIsoDate(faker.date.past()),
  notes: faker.lorem.sentence(),
  createdAt: DateFormats.dateObjToIsoDate(faker.date.past()),
}))
