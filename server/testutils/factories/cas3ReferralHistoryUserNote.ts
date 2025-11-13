import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import type { Cas3ReferralHistoryUserNote } from '@approved-premises/api'

export default Factory.define<Cas3ReferralHistoryUserNote>(() => ({
  message: faker.lorem.lines(),
}))
