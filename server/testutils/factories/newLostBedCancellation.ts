import { Factory } from 'fishery'
import { fakerEN_GB as faker } from '@faker-js/faker'

import type { NewLostBedCancellation } from '@approved-premises/api'

export default Factory.define<NewLostBedCancellation>(() => {
  return { notes: faker.lorem.sentence() }
})
