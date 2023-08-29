import type { ReferralHistorySystemNote } from '@approved-premises/api'
import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<ReferralHistorySystemNote>(() => ({
  id: faker.string.uuid(),
  createdByUserName: faker.person.fullName(),
  createdAt: DateFormats.dateObjToIsoDate(faker.date.past()),
  message: '',
  category: faker.helpers.arrayElement([
    'submitted',
    'unallocated',
    'in_review',
    'ready_to_place',
    'rejected',
    'completed',
  ] as Array<ReferralHistorySystemNote['category']>),
  type: 'system',
}))
