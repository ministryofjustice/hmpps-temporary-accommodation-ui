import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { NewCancellation } from 'approved-premises'
import referenceDataFactory from './referenceData'
import { DateFormats } from '../../utils/dateFormats'

export default Factory.define<NewCancellation>(() => {
  const date = faker.date.soon()
  return {
    id: faker.datatype.uuid(),
    date: DateFormats.formatApiDate(faker.date.soon()),
    'date-day': date.getDate().toString(),
    'date-month': date.getMonth().toString(),
    'date-year': date.getFullYear().toString(),
    bookingId: faker.datatype.uuid(),
    reason: referenceDataFactory.cancellationReasons().build().id,
    notes: faker.lorem.sentence(),
  }
})
