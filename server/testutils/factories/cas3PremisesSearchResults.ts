import { Cas3PremisesSearchResults } from '@approved-premises/api'
import { Factory } from 'fishery'
import { fakerEN_GB as faker } from '@faker-js/faker'
import cas3PremisesSearchResultFactory from './cas3PremisesSearchResult'

export default Factory.define<Cas3PremisesSearchResults>(() => {
  const results = faker.helpers.multiple(() => cas3PremisesSearchResultFactory.build(), { count: { min: 0, max: 10 } })
  return {
    results,
    totalPremises: results.length,
    totalOnlineBedspaces: results.reduce((acc, result) => acc + result.bedspaces.length, 0),
    totalUpcomingBedspaces: faker.number.int({ min: 0, max: 10 }),
  }
})
