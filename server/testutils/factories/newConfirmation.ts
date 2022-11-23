import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { NewConfirmation } from '@approved-premises/api'

export default Factory.define<NewConfirmation>(() => ({
  notes: faker.lorem.sentence(),
}))
