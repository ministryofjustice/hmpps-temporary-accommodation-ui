import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import type { ReferralHistoryUserNote } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<ReferralHistoryUserNote>(() => ({
  id: faker.string.uuid(),
  createdByUserName: faker.person.fullName(),
  createdAt: DateFormats.dateObjToIsoDate(faker.date.past()),
  message: faker.lorem.lines(),
  type: 'user',
}))
