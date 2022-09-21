import { SuperAgentRequest } from 'superagent'

import type { Application, ApplicationSummary } from 'approved-premises'

import { getMatchingRequests, stubFor } from '../../wiremock'

export default {
  stubApplications: (applicationSummaries: ApplicationSummary): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: `/applications`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: applicationSummaries,
      },
    }),
  stubApplicationCreate: (args: { application: Application }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: `/applications`,
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.application,
      },
    }),
  stubApplicationUpdate: (args: { application: Application }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'PUT',
        url: `/applications/${args.application.id}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.application,
      },
    }),
  verifyApplicationUpdate: async (applicationId: string) =>
    (
      await getMatchingRequests({
        method: 'PUT',
        url: `/applications/${applicationId}`,
      })
    ).body.requests,
}
