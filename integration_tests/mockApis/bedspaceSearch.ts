import type { Response, SuperAgentRequest } from 'superagent'
import { Cas3BedspaceSearchResults } from '@approved-premises/api'

import api from '../../server/paths/api'
import { getMatchingRequests, stubFor } from '.'
import { characteristics, pdus } from '../../server/testutils/stubs/referenceDataStubs'
import { errorStub } from './utils'

export default {
  stubBedspaceSearch: (searchResults: Cas3BedspaceSearchResults): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: api.bedspaces.search({}),
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: searchResults,
      },
    }),
  stubBedspaceSearchErrors: (params: Array<string>): SuperAgentRequest =>
    stubFor(errorStub(params, api.bedspaces.search({}), 'POST')),
  verifyBedSearch: async () =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: api.bedspaces.search({}),
      })
    ).body.requests,
  stubBedspaceSearchReferenceData: (): Promise<[Response, Response]> =>
    Promise.all([stubFor(pdus), stubFor(characteristics)]),
}
