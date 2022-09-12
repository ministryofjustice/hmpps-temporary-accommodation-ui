import applicationSummaryFactory from '../server/testutils/factories/applicationSummary'

export default [
  {
    request: {
      method: 'GET',
      url: `/applications/previous`,
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: applicationSummaryFactory.buildList(20),
    },
  },
]
