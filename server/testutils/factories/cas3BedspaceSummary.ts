/* istanbul ignore file */

import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import type { Cas3BedspaceSummary as BedspaceSummary } from '@approved-premises/api'

export default Factory.define<BedspaceSummary>(() => ({
  id: faker.string.uuid(),
  reference: `Room ${faker.number.int({ min: 1, max: 9999 })}`,
  status: faker.helpers.arrayElement(['online', 'archived'] as const),
}))
