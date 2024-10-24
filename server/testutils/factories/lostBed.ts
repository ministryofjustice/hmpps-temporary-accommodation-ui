import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import type { LostBed } from '@approved-premises/api'
import { ReferenceData } from '../../@types/ui'
import { DateFormats } from '../../utils/dateUtils'
import lostBedCancellationFactory from './lostBedCancellation'
import referenceDataFactory from './referenceData'

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

  /* istanbul ignore next */
  past() {
    return this.params({
      startDate: DateFormats.dateObjToIsoDate(faker.date.past()),
    })
  }

  /* istanbul ignore next */
  forEnvironment(reasons: ReferenceData[]) {
    return this.params({
      reason: faker.helpers.arrayElement(reasons),
    })
  }
}

export default LostBedFactory.define(() => ({
  id: faker.string.uuid(),
  bedName: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
  roomName: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
  notes: faker.lorem.sentence(),
  startDate: DateFormats.dateObjToIsoDate(faker.date.soon()),
  endDate: DateFormats.dateObjToIsoDate(faker.date.future()),
  referenceNumber: faker.string.uuid(),
  reason: referenceDataFactory.lostBedReasons().build(),
  status: faker.helpers.arrayElement(['active', 'cancelled'] as const),
  bedId: faker.string.uuid(),
  cancellation: lostBedCancellationFactory.build(),
}))
