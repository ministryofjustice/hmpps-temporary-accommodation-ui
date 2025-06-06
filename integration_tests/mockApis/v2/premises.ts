import type { Cas3PremisesSearchResults, Cas3PremisesStatus } from '@approved-premises/api'
import { stubFor } from '..'

type SearchArguments = {
  searchResults: Cas3PremisesSearchResults
  postcodeOrAddress: string
  premisesStatus: Cas3PremisesStatus
}

const stubPremisesSearchV2 = (args: SearchArguments) =>
  stubFor({
    request: {
      method: 'GET',
      urlPathPattern: '/cas3/premises/search',
      queryParameters: {
        postcodeOrAddress: { equalTo: args.postcodeOrAddress },
        premisesStatus: { equalTo: args.premisesStatus },
      },
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: args.searchResults,
    },
  })

export default {
  stubPremisesSearchV2,
}
