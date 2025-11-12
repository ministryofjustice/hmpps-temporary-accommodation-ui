import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import type { Cas3Cancellation } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'
import referenceDataFactory from './referenceData'

export default Factory.define<Cas3Cancellation>(() => ({
  id: faker.string.uuid(),
  premisesName: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
  date: DateFormats.dateObjToIsoDate(faker.date.soon()),
  bookingId: faker.string.uuid(),
  reason: referenceDataFactory.cancellationReasons().build(),
  notes: faker.lorem.sentence(),
  createdAt: DateFormats.dateObjToIsoDateTime(faker.date.past()),
}))
