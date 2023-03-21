import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { LostBed } from '@approved-premises/api'
import referenceDataFactory from './referenceData'
import lostBedCancellationFactory from './lostBedCancellation'
import { DateFormats } from '../../utils/dateUtils'

class LostBedFactory extends Factory<LostBed> {
  active() {
    return this.params({
      status: 'active',
    })
  }

  cancelled() {
    return this.params({
      status: 'cancelled',
    })
  }

  past() {
    return this.params({
      startDate: DateFormats.dateObjToIsoDate(faker.date.past()),
    })
  }
}

export default LostBedFactory.define(() => ({
  id: faker.datatype.uuid(),
  notes: faker.lorem.sentence(),
  startDate: DateFormats.dateObjToIsoDate(faker.date.soon()),
  endDate: DateFormats.dateObjToIsoDate(faker.date.future()),
  referenceNumber: faker.datatype.uuid(),
  reason: referenceDataFactory.lostBedReasons().build(),
  status: faker.helpers.arrayElement(['active', 'cancelled'] as const),
  bedId: faker.datatype.uuid(),
  cancellation: lostBedCancellationFactory.build(),
}))
