import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Departure } from 'approved-premises'
import referenceDataFactory from './referenceData'
import premisesFactory from './premises'

export default Factory.define<Departure>(() => ({
  id: faker.datatype.uuid(),
  dateTime: faker.date.soon().toISOString(),
  bookingId: faker.datatype.uuid(),
  reason: referenceDataFactory.departureReasons().build(),
  notes: faker.lorem.sentence(),
  moveOnCategory: referenceDataFactory.moveOnCategories().build(),
  destinationProvider: referenceDataFactory.destinationProviders().build(),
  destinationAp: premisesFactory.build(),
}))
