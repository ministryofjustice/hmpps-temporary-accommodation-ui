import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import type { Cas3Departure } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'
import referenceDataFactory from './referenceData'

export default Factory.define<Cas3Departure>(() => ({
  id: faker.string.uuid(),
  dateTime: DateFormats.dateObjToIsoDateTime(faker.date.past()),
  bookingId: faker.string.uuid(),
  reason: referenceDataFactory.departureReasons().build(),
  notes: faker.lorem.sentence(),
  moveOnCategory: referenceDataFactory.moveOnCategories().build(),
  destinationProvider: referenceDataFactory.destinationProviders().build(),
  createdAt: DateFormats.dateObjToIsoDate(faker.date.past()),
}))
