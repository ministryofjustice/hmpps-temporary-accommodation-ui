import { crnRegex } from '.'
import paths from '../server/paths/api'
import activeOffenceFactory from '../server/testutils/factories/activeOffence'

export default [
  {
    request: {
      method: 'GET',
      urlPathPattern: paths.people.offences({ crn: crnRegex }),
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: activeOffenceFactory.buildList(5),
    },
  },
]
