import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import type { Departure } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'
import referenceDataFactory from './referenceData'

export default Factory.define<Departure>(() => ({
  id: faker.string.uuid(),
  dateTime: DateFormats.dateObjToIsoDateTime(faker.date.soon()),
  bookingId: faker.string.uuid(),
  reason: referenceDataFactory.departureReasons().build(),
  notes: faker.lorem.sentence(),
  moveOnCategory: referenceDataFactory.moveOnCategories().build(),
  destinationProvider: referenceDataFactory.destinationProviders().build(),
  createdAt: DateFormats.dateObjToIsoDate(faker.date.past()),
}))
