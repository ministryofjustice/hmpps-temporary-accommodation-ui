/* istanbul ignore file */

import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { Cas3BedspacePremisesSearchResult } from '@approved-premises/api'

export default Factory.define<Cas3BedspacePremisesSearchResult>(() => ({
  id: faker.string.uuid(),
  reference: `Room ${faker.number.int({ min: 1, max: 9999 })}`,
  status: faker.helpers.arrayElement(['online', 'archived'] as const),
}))
