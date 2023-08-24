import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import type { ReferralHistoryNote } from '@approved-premises/api'

import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<ReferralHistoryNote>(() => ({
  id: faker.string.uuid(),
  createdAt: DateFormats.dateObjToIsoDate(faker.date.past()),
  message: faker.lorem.lines(),
}))
