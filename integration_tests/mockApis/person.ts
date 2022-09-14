import { SuperAgentRequest } from 'superagent'

import type { Person } from 'approved-premises'

import { stubFor, getMatchingRequests } from '../../wiremock'
import { errorStub } from '../../wiremock/utils'

export default {
  stubFindPerson: (args: { person: Person }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: `/people/search?crn=${args.person.crn}`,
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.person,
      },
    }),
  stubFindPersonErrors: (args: { params: Array<string> }): SuperAgentRequest =>
    stubFor(errorStub(args.params, '/people/search')),
  stubPersonNotFound: (args: { person: Person }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: '/people/search',
        bodyPatterns: [{ matchesJsonPath: `$.[?(@.crn === ${args.person.crn})]` }],
      },
      response: {
        status: 404,
      },
    }),
  verifyFindPerson: async () =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: '/people/search',
      })
    ).body.requests,
}
