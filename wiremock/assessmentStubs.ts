import paths from '../server/paths/api'
import { assessmentFactory, assessmentSummaryFactory } from '../server/testutils/factories'

const assessmentSummaries = assessmentSummaryFactory.buildList(20)

const assessmentStubs = [
  {
    request: {
      method: 'GET',
      url: paths.assessments.index({}),
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: assessmentSummaries,
    },
  },
  ...assessmentSummaries
    .map(asessmentSummary => {
      const assessment = assessmentFactory.build(asessmentSummary)

      return [
        {
          request: {
            method: 'GET',
            url: paths.assessments.show({ id: assessment.id }),
          },
          response: {
            status: 200,
            headers: { 'Content-Type': 'application/json;charset=UTF-8' },
            jsonBody: assessment,
          },
        },
        {
          request: {
            method: 'DELETE',
            url: paths.assessments.allocation({ id: assessment.id }),
          },
          response: {
            status: 200,
            headers: { 'Content-Type': 'application/json;charset=UTF-8' },
            jsonBody: {},
          },
        },
        {
          request: {
            method: 'POST',
            url: paths.assessments.allocation({ id: assessment.id }),
          },
          response: {
            status: 200,
            headers: { 'Content-Type': 'application/json;charset=UTF-8' },
            jsonBody: {},
          },
        },
        {
          request: {
            method: 'POST',
            url: paths.assessments.rejection({ id: assessment.id }),
          },
          response: {
            status: 200,
            headers: { 'Content-Type': 'application/json;charset=UTF-8' },
            jsonBody: {},
          },
        },
        {
          request: {
            method: 'POST',
            url: paths.assessments.acceptance({ id: assessment.id }),
          },
          response: {
            status: 200,
            headers: { 'Content-Type': 'application/json;charset=UTF-8' },
            jsonBody: {},
          },
        },
        {
          request: {
            method: 'POST',
            url: paths.assessments.closure({ id: assessment.id }),
          },
          response: {
            status: 200,
            headers: { 'Content-Type': 'application/json;charset=UTF-8' },
            jsonBody: {},
          },
        },
      ]
    })
    .flat(),
]

export default assessmentStubs
