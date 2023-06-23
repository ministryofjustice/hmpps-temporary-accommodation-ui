import { crnRegex } from '.'
import paths from '../server/paths/api'
import { adjudicationFactory } from '../server/testutils/factories'

export default [
  {
    request: {
      method: 'GET',
      urlPathPattern: paths.people.adjudications({ crn: crnRegex }),
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: adjudicationFactory.buildList(5),
    },
  },
]
