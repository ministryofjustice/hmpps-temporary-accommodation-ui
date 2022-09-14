import personFactory from '../server/testutils/factories/person'

const personStubs: Array<Record<string, unknown>> = []

personStubs.push({
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

export default personStubs
