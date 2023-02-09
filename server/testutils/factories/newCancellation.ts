import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { NewCancellation } from '@approved-premises/api'
import referenceDataFactory from './referenceData'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<NewCancellation>(() => ({
  id: faker.datatype.uuid(),
  date: DateFormats.dateObjToIsoDate(faker.date.soon()),
  bookingId: faker.datatype.uuid(),
  reason: referenceDataFactory.cancellationReasons().build().id,
  notes: faker.lorem.sentence(),
}))
