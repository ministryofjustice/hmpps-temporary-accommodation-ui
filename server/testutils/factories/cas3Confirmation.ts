import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import type { Cas3Confirmation } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<Cas3Confirmation>(() => ({
  id: faker.string.uuid(),
  bookingId: faker.string.uuid(),
  dateTime: DateFormats.dateObjToIsoDateTime(faker.date.past()),
  notes: faker.lorem.sentence(),
  createdAt: DateFormats.dateObjToIsoDateTime(faker.date.past()),
}))
