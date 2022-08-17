import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Cancellation } from 'approved-premises'
import referenceDataFactory from './referenceData'

export default Factory.define<Cancellation>(() => ({
  id: faker.datatype.uuid(),
  date: faker.date.soon().toISOString(),
  bookingId: faker.datatype.uuid(),
  reason: referenceDataFactory.cancellationReasons().build(),
  notes: faker.lorem.sentence(),
}))
