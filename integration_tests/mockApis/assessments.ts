import type { SuperAgentRequest } from 'superagent'
import { Assessment, AssessmentSummary, TemporaryAccommodationAssessment, Cas3Unit } from '../../server/@types/shared'

import api from '../../server/paths/api'
import { getMatchingRequests, stubFor } from '.'
import { errorStub } from './utils'
import { MockPagination } from './bookingSearch'
import { referralRejectionReasons } from '../../server/testutils/stubs/referenceDataStubs'

export default {
  stubAssessments: (args: { data: Array<AssessmentSummary>; pagination?: MockPagination }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: api.assessments.index({}),
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'x-pagination-currentpage': args.pagination?.pageNumber.toString(),
          'x-pagination-pagesize': args.pagination?.pageSize.toString(),
          'x-pagination-totalpages': args.pagination?.totalPages.toString(),
          'x-pagination-totalresults': args.pagination?.totalResults.toString(),
        },
        jsonBody: args.data,
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
  stubAssessmentReferralHistoryGet: (args: {
    assessment: TemporaryAccommodationAssessment
    referralNotes
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: `/cas3/timeline/${args.assessment.id}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.referralNotes,
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
  stubReferralRejectionReasons: (): SuperAgentRequest => stubFor(referralRejectionReasons),
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
  stubCreateAssessmentNote: (assessment: Assessment): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: api.assessments.notes({ id: assessment.id }),
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    }),
  verifyCreateAssessmentNote: async (assessmentId: string) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: api.assessments.notes({ id: assessmentId }),
      })
    ).body.requests,
  stubCreateAssessmentNoteErrors: (args: { assessmentId: string; params: Array<string> }): SuperAgentRequest =>
    stubFor(errorStub(args.params, api.assessments.notes({ id: args.assessmentId }), 'POST')),
  stubUpdateAssessment: (assessment: Assessment): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'PUT',
        url: api.assessments.update({ id: assessment.id }),
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    }),
  stubUpdateAssessmentError: (args: { assessment: Assessment; errorBody: Record<string, Cas3Unit> }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'PUT',
        url: api.assessments.update({ id: args.assessment.id }),
      },
      response: {
        status: 400,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          type: 'https://example.net/validation-error',
          title: 'Bad request',
          status: 400,
          detail: 'You provided invalid request parameters',
          ...args.errorBody,
        },
      },
    }),
}
