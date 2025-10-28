import { SuperAgentRequest } from 'superagent'

import type { Cas3Application } from '@approved-premises/api'

import { getMatchingRequests, stubFor } from '.'

export default {
  stubApplications: (applications: Array<Cas3Application>): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: `/cas3/applications`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: applications,
      },
    }),
  stubApplicationCreate: (args: { application: Cas3Application }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: `/cas3/applications?createWithRisks=true`,
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { ...args.application, data: null },
      },
    }),
  stubApplicationUpdate: (args: { application: Cas3Application }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'PUT',
        url: `/cas3/applications/${args.application.id}`,
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        body: `
        {
          "id": "{{request.pathSegments.[1]}}",
          "person": ${JSON.stringify(args.application.person)},
          "createdByProbationOfficerId": "${args.application.createdByUserId}",
          "createdAt": "${args.application.createdAt}",
          "submittedAt": "${args.application.submittedAt}",
          "data": {{{jsonPath request.body '$.data'}}}
        }
        `,
        transformers: ['response-template'],
      },
    }),
  stubApplicationGet: (args: { application: Cas3Application }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: `/cas3/applications/${args.application.id}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.application,
      },
    }),
  stubApplicationReferralHistoryGet: (args: { application: Cas3Application; referralNotes }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: `/cas3/timeline/${args.application.assessmentId}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.referralNotes,
      },
    }),
  stubApplicationSubmit: (args: { application: Cas3Application }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: `/cas3/applications/${args.application.id}/submission`,
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
        url: `/cas3/applications?createWithRisks=true`,
      })
    ).body.requests,
  verifyApplicationUpdate: async (applicationId: string) =>
    (
      await getMatchingRequests({
        method: 'PUT',
        url: `/cas3/applications/${applicationId}`,
      })
    ).body.requests,
  verifyApplicationSubmit: async (applicationId: string) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: `/cas3/applications/${applicationId}/submission`,
      })
    ).body.requests,
  stubApplicationDelete: (args: { application: Cas3Application }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'DELETE',
        url: `/cas3/applications/${args.application.id}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { ...args.application, data: {} },
      },
    }),
}
