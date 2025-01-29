import type { Response, SuperAgentRequest } from 'superagent'
import { BedSearchResults } from '../../server/@types/shared'

import api from '../../server/paths/api'
import { getMatchingRequests, stubFor } from '../../wiremock'
import { characteristics, pdus } from '../../wiremock/referenceDataStubs'
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
  stubBedspaceSearchReferenceData: (): Promise<[Response, Response]> =>
    Promise.all([stubFor(pdus), stubFor(characteristics)]),
}
