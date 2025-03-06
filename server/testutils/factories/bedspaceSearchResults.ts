import { Factory } from 'fishery'

import { faker } from '@faker-js/faker'
import type { Cas3BedspaceSearchResults, Premises } from '@approved-premises/api'
import bedspaceSearchResult from './bedspaceSearchResult'

class BedspaceSearchResultsFactory extends Factory<Cas3BedspaceSearchResults> {
  /* istanbul ignore next */
  forPremises(premises: Premises[]) {
    const resultPremises = faker.helpers.arrayElements(premises)

    return this.params({
      results: resultPremises.map(p => bedspaceSearchResult.forPremises(p).build()),
      resultsBedCount: resultPremises.length,
    })
  }
}

export default BedspaceSearchResultsFactory.define(() => {
  const results = bedspaceSearchResult.buildList(faker.number.int({ min: 5, max: 10 }))

  return {
    resultsRoomCount: faker.number.int({ min: 5, max: 10 }),
    resultsPremisesCount: faker.number.int({ min: 5, max: 10 }),
    resultsBedCount: results.length,
    results,
  }
})
