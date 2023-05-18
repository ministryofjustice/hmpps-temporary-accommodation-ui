import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import type { NewCancellation } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'
import referenceDataFactory from './referenceData'

export default Factory.define<NewCancellation>(() => ({
  id: faker.string.uuid(),
  date: DateFormats.dateObjToIsoDate(faker.date.soon()),
  bookingId: faker.string.uuid(),
  reason: referenceDataFactory.cancellationReasons().build().id,
  notes: faker.lorem.sentence(),
}))
