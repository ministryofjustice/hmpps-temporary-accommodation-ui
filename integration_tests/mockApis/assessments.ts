import type { SuperAgentRequest } from 'superagent'
import { Assessment } from '../../server/@types/shared'

import api from '../../server/paths/api'
import { stubFor } from '../../wiremock'

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
}
