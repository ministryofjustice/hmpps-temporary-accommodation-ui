import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import type { NewReferralHistoryUserNote } from '@approved-premises/api'

export default Factory.define<NewReferralHistoryUserNote>(() => ({
  message: faker.lorem.lines(),
}))
