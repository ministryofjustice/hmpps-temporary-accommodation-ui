import type { ReferralHistorySystemNote } from '@approved-premises/api'
import { fakerEN_GB as faker } from '@faker-js/faker'
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
