import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import type { Cas3VoidBedspaceCancellation } from '@approved-premises/api'

export default Factory.define<Cas3VoidBedspaceCancellation>(() => ({
  cancellationNotes: faker.lorem.sentence(),
}))
