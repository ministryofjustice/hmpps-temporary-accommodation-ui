import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import type { Departure } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'
import referenceDataFactory from './referenceData'

class DepartureFactory extends Factory<Departure> {
  withDestinationProvider() {
    return this.params({
      destinationProvider: referenceDataFactory.destinationProviders().build(),
    })
  }
}

export default DepartureFactory.define(() => ({
  id: faker.string.uuid(),
  dateTime: DateFormats.dateObjToIsoDateTime(faker.date.past()),
  bookingId: faker.string.uuid(),
  reason: referenceDataFactory.departureReasons().build(),
  notes: faker.lorem.sentence(),
  createdAt: DateFormats.dateObjToIsoDateTime(faker.date.past()),
  moveOnCategory: referenceDataFactory.moveOnCategories().build(),
}))
