import { Factory } from 'fishery'

import { faker } from '@faker-js/faker'
import type { Cas3v2BedspaceSearchResults } from '@approved-premises/api'
import cas3BedspaceSearchResultFactory from './cas3BedspaceSearchResult'

export default Factory.define<Cas3v2BedspaceSearchResults>(() => {
  const results = cas3BedspaceSearchResultFactory.buildList(faker.number.int({ min: 5, max: 10 }))

  return {
    resultsPremisesCount: faker.number.int({ min: 5, max: 10 }),
    resultsBedspaceCount: results.length,
    results,
  }
})
