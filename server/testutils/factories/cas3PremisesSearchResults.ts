import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import type { Cas3PremisesSearchResults } from '@approved-premises/api'

export default Factory.define<Cas3PremisesSearchResults>(() => ({
  results: [],
  totalPremises: faker.number.int({ min: 0, max: 50 }),
  totalOnlineBedspaces: faker.number.int({ min: 0, max: 200 }),
  totalUpcomingBedspaces: faker.number.int({ min: 0, max: 100 }),
}))
