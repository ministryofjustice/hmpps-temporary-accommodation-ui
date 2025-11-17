import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import type { Cas3VoidBedspace } from '@approved-premises/api'
import { ReferenceData } from '@approved-premises/ui'
import { DateFormats } from '../../utils/dateUtils'
import cas3VoidBedspaceReasonFactory from './cas3VoidBedspaceReason'

class Cas3VoidBedspaceFactory extends Factory<Cas3VoidBedspace> {
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

export default Cas3VoidBedspaceFactory.define(() => ({
  bedspaceId: faker.string.uuid(),
  bedspaceName: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
  cancellationDate: DateFormats.dateObjToIsoDate(faker.date.recent()),
  cancellationNotes: faker.lorem.sentence(),
  costCentre: faker.helpers.arrayElement(['HMPPS', 'SUPPLIER']),
  endDate: DateFormats.dateObjToIsoDate(faker.date.future()),
  id: faker.string.uuid(),
  notes: faker.lorem.sentence(),
  reason: cas3VoidBedspaceReasonFactory.build(),
  referenceNumber: faker.string.uuid(),
  startDate: DateFormats.dateObjToIsoDate(faker.date.soon()),
  status: faker.helpers.arrayElement(['active', 'cancelled'] as const),
}))
