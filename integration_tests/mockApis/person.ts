import { SuperAgentRequest } from 'superagent'

import type { Person } from 'approved-premises'

import { stubFor, getMatchingRequests } from '../../wiremock'
import { errorStub } from '../../wiremock/utils'

export default {
  stubFindPerson: (args: { person: Person }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: '/people/search',
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.person,
      },
    }),
  stubFindPersonErrors: (args: { params: Array<string> }): SuperAgentRequest =>
    stubFor(errorStub(args.params, '/people/search')),
  verifyFindPerson: async () =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: '/people/search',
      })
    ).body.requests,
}
