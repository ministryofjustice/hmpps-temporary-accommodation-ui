import paths from '../server/paths/api'
import { assessmentFactory, assessmentSummaryFactory } from '../server/testutils/factories'

const assessmentSummaries = assessmentSummaryFactory.buildList(20)

const assessment = assessmentFactory.build()

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
]

export default assessmentStubs
