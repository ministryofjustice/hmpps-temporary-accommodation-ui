import personFactory from '../server/testutils/factories/person'
import { errorStub } from './utils'

const personStubs: Array<Record<string, unknown>> = []

personStubs.push({
  priority: 99,
  request: {
    method: 'POST',
    urlPathPattern: `/people/search`,
  },
  response: {
    status: 201,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    jsonBody: personFactory.build(),
  },
})

personStubs.push(errorStub(['crn'], `people/search`))

export default personStubs
