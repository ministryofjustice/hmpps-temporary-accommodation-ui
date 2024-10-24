import { Factory } from 'fishery'
import { fakerEN_GB as faker } from '@faker-js/faker'

import type { NewConfirmation } from '@approved-premises/api'

export default Factory.define<NewConfirmation>(() => ({
  notes: faker.lorem.sentence(),
}))
