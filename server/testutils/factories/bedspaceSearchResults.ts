import { Factory } from 'fishery'

import { faker } from '@faker-js/faker'
import type { Cas3BedspaceSearchResults } from '@approved-premises/api'
import bedspaceSearchResult from './bedspaceSearchResult'

export default Factory.define<Cas3BedspaceSearchResults>(() => {
  const results = bedspaceSearchResult.buildList(faker.number.int({ min: 5, max: 10 }))

  return {
    resultsRoomCount: faker.number.int({ min: 5, max: 10 }),
    resultsPremisesCount: faker.number.int({ min: 5, max: 10 }),
    resultsBedCount: results.length,
    results,
  }
})
