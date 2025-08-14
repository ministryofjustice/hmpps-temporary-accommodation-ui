import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import type { Cas3PremisesBedspaceTotals } from '@approved-premises/api'

export default Factory.define<Cas3PremisesBedspaceTotals>(() => ({
  id: faker.string.uuid(),
  status: faker.helpers.arrayElement(['online', 'archived'] as const),
  premisesEndDate: null,
  totalOnlineBedspaces: faker.number.int({ min: 1, max: 10 }),
  totalArchivedBedspaces: faker.number.int({ min: 1, max: 5 }),
  totalUpcomingBedspaces: faker.number.int({ min: 1, max: 5 }),
}))
