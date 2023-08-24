import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import type { NewReferralHistoryUserNote } from '@approved-premises/api'

export default Factory.define<NewReferralHistoryUserNote>(() => ({
  message: faker.lorem.lines(),
}))
