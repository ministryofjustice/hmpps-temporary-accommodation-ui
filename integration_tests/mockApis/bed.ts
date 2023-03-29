import type { SuperAgentRequest } from 'superagent'
import { BedSearchResults } from '../../server/@types/shared'

import api from '../../server/paths/api'
import { getMatchingRequests, stubFor } from '../../wiremock'
import { errorStub } from '../../wiremock/utils'

export default {
  stubBedSearch: (searchResults: BedSearchResults): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: api.beds.search({}),
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: searchResults,
      },
    }),
  stubBedSearchErrors: (params: Array<string>): SuperAgentRequest =>
    stubFor(errorStub(params, api.beds.search({}), 'POST')),
  verifyBedSearch: async () =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: api.beds.search({}),
      })
    ).body.requests,
}
