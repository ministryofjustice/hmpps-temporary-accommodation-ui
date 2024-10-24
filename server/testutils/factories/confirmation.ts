import { fakerEN_GB as faker } from '@faker-js/faker'
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
