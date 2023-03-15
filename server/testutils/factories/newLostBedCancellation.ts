import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { NewLostBedCancellation } from '@approved-premises/api'

export default Factory.define<NewLostBedCancellation>(() => {
  return { notes: faker.lorem.sentence() }
})
