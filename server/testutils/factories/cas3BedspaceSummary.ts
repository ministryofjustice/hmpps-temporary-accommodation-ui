/* istanbul ignore file */

import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { Cas3BedspacePremisesSearchResult } from '@approved-premises/api'

export default Factory.define<Cas3BedspacePremisesSearchResult>(() => ({
  id: faker.string.uuid(),
  reference: faker.string.alphanumeric(6),
  status: faker.helpers.arrayElement(['online', 'archived'] as const),
}))
