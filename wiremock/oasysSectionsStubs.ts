import { crnRegex } from '.'
import paths from '../server/paths/api'
import oasysSectionsFactory from '../server/testutils/factories/oasysSections'

export default [
  {
    request: {
      method: 'GET',
      urlPathPattern: paths.people.oasys.sections({ crn: crnRegex }),
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: oasysSectionsFactory.build(),
    },
  },
]
