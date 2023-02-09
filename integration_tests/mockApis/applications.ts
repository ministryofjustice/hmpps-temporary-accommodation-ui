import { SuperAgentRequest } from 'superagent'

import type { ApprovedPremisesApplication } from '@approved-premises/api'

import { getMatchingRequests, stubFor } from '../../wiremock'

export default {
  stubApplications: (applications: ApprovedPremisesApplication): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: `/applications`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: applications,
      },
    }),
  stubApplicationCreate: (args: { application: ApprovedPremisesApplication }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: `/applications?createWithRisks=true`,
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { ...args.application, data: null },
      },
    }),
  stubApplicationUpdate: (args: { application: ApprovedPremisesApplication }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'PUT',
        url: `/applications/${args.application.id}`,
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        body: `
        {
          "id": "{{request.pathSegments.[1]}}",
          "person": ${JSON.stringify(args.application.person)},
          "createdByProbationOfficerId": "${args.application.createdByUserId}",
          "schemaVersion": "${args.application.schemaVersion}",
          "createdAt": "${args.application.createdAt}",
          "submittedAt": "${args.application.submittedAt}",
          "data": {{{jsonPath request.body '$.data'}}}
        }
        `,
        transformers: ['response-template'],
      },
    }),
  stubApplicationGet: (args: { application: ApprovedPremisesApplication }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: `/applications/${args.application.id}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.application,
      },
    }),
  stubApplicationDocuments: (args: {
    application: ApprovedPremisesApplication
    documents: Array<Document>
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: `/applications/${args.application.id}/documents`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.documents,
      },
    }),
  stubApplicationSubmit: (args: { application: ApprovedPremisesApplication }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: `/applications/${args.application.id}/submission`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      },
    }),
  verifyApplicationCreate: async () =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: `/applications?createWithRisks=true`,
      })
    ).body.requests,
  verifyApplicationUpdate: async (applicationId: string) =>
    (
      await getMatchingRequests({
        method: 'PUT',
        url: `/applications/${applicationId}`,
      })
    ).body.requests,
  verifyApplicationSubmit: async (applicationId: string) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: `/applications/${applicationId}/submission`,
      })
    ).body.requests,
}
