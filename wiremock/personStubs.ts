import { personFactory } from '../server/testutils/factories'

const personStubs: Array<Record<string, unknown>> = []

personStubs.push({
  priority: 99,
  request: {
    method: 'GET',
    urlPathPattern: '/people/search',
    queryParameters: {
      crn: {
        matches: '.+',
      },
    },
  },
  response: {
    status: 200,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    jsonBody: personFactory.build(),
  },
})

personStubs.push({
  request: {
    method: 'GET',
    urlPathPattern: '/people/search',
    queryParameters: {
      crn: {
        equalTo: 'NOT_FOUND',
      },
    },
  },
  response: {
    status: 404,
  },
})

export default personStubs
