import paths from '../server/paths/api'
import { assessmentSummaryFactory } from '../server/testutils/factories'

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
]

export default assessmentStubs
