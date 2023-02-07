import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Departure } from '@approved-premises/api'
import referenceDataFactory from './referenceData'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<Departure>(() => ({
  id: faker.datatype.uuid(),
  dateTime: DateFormats.dateObjToIsoDateTime(faker.date.soon()),
  bookingId: faker.datatype.uuid(),
  reason: referenceDataFactory.departureReasons().build(),
  notes: faker.lorem.sentence(),
  moveOnCategory: referenceDataFactory.moveOnCategories().build(),
  destinationProvider: referenceDataFactory.destinationProviders().build(),
  createdAt: DateFormats.dateObjToIsoDate(faker.date.past()),
}))
