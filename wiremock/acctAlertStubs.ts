import { crnRegex } from '.'
import paths from '../server/paths/api'
import { acctAlertFactory } from '../server/testutils/factories'

export default [
  {
    request: {
      method: 'GET',
      urlPathPattern: paths.people.acctAlerts({ crn: crnRegex }),
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: acctAlertFactory.buildList(5),
    },
  },
]
