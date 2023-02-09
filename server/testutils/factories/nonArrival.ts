import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Nonarrival } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'
import referenceDataFactory from './referenceData'

export default Factory.define<Nonarrival>(() => ({
  id: faker.datatype.uuid(),
  bookingId: faker.datatype.uuid(),
  notes: faker.lorem.sentence(),
  reason: referenceDataFactory.nonArrivalReason().build(),
  date: DateFormats.dateObjToIsoDate(faker.date.soon()),
  createdAt: DateFormats.dateObjToIsoDate(faker.date.past()),
}))
