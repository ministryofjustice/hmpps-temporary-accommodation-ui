import { Factory } from 'fishery'

import { faker } from '@faker-js/faker'
import type { BedSearchResults, Premises } from '@approved-premises/api'
import bedSearchResult from './bedSearchResult'

class BedSearchResultsFactory extends Factory<BedSearchResults> {
  /* istanbul ignore next */
  forPremises(premises: Premises[]) {
    const resultPremises = faker.helpers.arrayElements(premises)

    return this.params({
      results: resultPremises.map(p => bedSearchResult.forPremises(p).build()),
      resultsBedCount: resultPremises.length,
    })
  }
}

export default BedSearchResultsFactory.define(() => {
  const results = bedSearchResult.buildList(faker.number.int({ min: 5, max: 10 }))

  return {
    resultsRoomCount: faker.number.int({ min: 5, max: 10 }),
    resultsPremisesCount: faker.number.int({ min: 5, max: 10 }),
    resultsBedCount: results.length,
    results,
  }
})
