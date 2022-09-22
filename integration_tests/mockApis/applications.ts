import { SuperAgentRequest } from 'superagent'

import type { ApplicationSummary } from 'approved-premises'

import { stubFor } from '../../wiremock'

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
}
