import type { Response, SuperAgentRequest } from 'superagent'
import { Cas3v2BedspaceSearchResults } from '@approved-premises/api'

import api from '../../server/paths/api'
import { getMatchingRequests, stubFor } from '.'
import { bedspaceCharacteristics, pdus, premisesCharacteristics } from '../../server/testutils/stubs/referenceDataStubs'
import { errorStub } from './utils'

export default {
  stubBedspaceSearch: (searchResults: Cas3v2BedspaceSearchResults): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: api.cas3.bedspaces.search({}),
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: searchResults,
      },
    }),
  stubBedspaceSearchErrors: (params: Array<string>): SuperAgentRequest =>
    stubFor(errorStub(params, api.cas3.bedspaces.search({}), 'POST')),
  verifyBedSearch: async () =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: api.cas3.bedspaces.search({}),
      })
    ).body.requests,
  stubBedspaceSearchReferenceData: (): Promise<[Response, Response, Response]> =>
    Promise.all([stubFor(pdus), stubFor(premisesCharacteristics), stubFor(bedspaceCharacteristics)]),
}
