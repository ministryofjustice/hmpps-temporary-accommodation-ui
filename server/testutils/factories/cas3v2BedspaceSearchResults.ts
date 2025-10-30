import { Factory } from 'fishery'

import { faker } from '@faker-js/faker'
import type { Cas3v2BedspaceSearchResults } from '@approved-premises/api'
import cas3v2BedspaceSearchResultFactory from './cas3v2BedspaceSearchResult'

export default Factory.define<Cas3v2BedspaceSearchResults>(() => {
  const results = cas3v2BedspaceSearchResultFactory.buildList(faker.number.int({ min: 5, max: 10 }))

  return {
    resultsPremisesCount: faker.number.int({ min: 5, max: 10 }),
    resultsBedspaceCount: results.length,
    results,
  }
})
