import type { SuperAgentRequest } from 'superagent'
import { Assessment } from '../../server/@types/shared'

import api from '../../server/paths/api'
import { getMatchingRequests, stubFor } from '../../wiremock'

export default {
  stubAssessments: (assessments: Array<Assessment>): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: api.assessments.index({}),
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: assessments,
      },
    }),
  stubFindAssessment: (assessment: Assessment): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: api.assessments.show({ id: assessment.id }),
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: assessment,
      },
    }),
  stubUnallocateAssessment: (assessment: Assessment): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'DELETE',
        url: api.assessments.allocation({ id: assessment.id }),
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    }),
  verifyUnallocateAssessment: async (assessmentId: string) =>
    (
      await getMatchingRequests({
        method: 'DELETE',
        url: api.assessments.allocation({ id: assessmentId }),
      })
    ).body.requests,
  stubAllocateAssessment: (assessment: Assessment): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: api.assessments.allocation({ id: assessment.id }),
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    }),
  verifyAllocateAssessment: async (assessmentId: string) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: api.assessments.allocation({ id: assessmentId }),
      })
    ).body.requests,
  stubRejectAssessment: (assessment: Assessment): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: api.assessments.rejection({ id: assessment.id }),
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    }),
  verifyRejectAssessment: async (assessmentId: string) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: api.assessments.rejection({ id: assessmentId }),
      })
    ).body.requests,
  stubAcceptAssessment: (assessment: Assessment): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: api.assessments.acceptance({ id: assessment.id }),
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    }),
  verifyAcceptAssessment: async (assessmentId: string) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: api.assessments.acceptance({ id: assessmentId }),
      })
    ).body.requests,
  stubCloseAssessment: (assessment: Assessment): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: api.assessments.closure({ id: assessment.id }),
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    }),
  verifyCloseAssessment: async (assessmentId: string) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: api.assessments.closure({ id: assessmentId }),
      })
    ).body.requests,
}
