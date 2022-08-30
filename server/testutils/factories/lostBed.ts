import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { LostBed } from 'approved-premises'
import referenceDataFactory from './referenceData'

export default Factory.define<LostBed>(() => ({
  id: faker.datatype.uuid(),
  notes: faker.lorem.sentence(),
  startDate: faker.date.soon().toISOString(),
  endDate: faker.date.future().toISOString(),
  numberOfBeds: faker.datatype.number({ max: 10 }),
  referenceNumber: faker.datatype.uuid(),
  reason: referenceDataFactory.lostBedReasons().build(),
}))
