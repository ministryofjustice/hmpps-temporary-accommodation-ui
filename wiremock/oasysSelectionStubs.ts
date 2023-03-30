import { crnRegex } from '.'
import paths from '../server/paths/api'
import { oasysSelectionFactory } from '../server/testutils/factories'

export default [
  {
    request: {
      method: 'GET',
      urlPathPattern: paths.people.oasys.selection({ crn: crnRegex }),
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: oasysSelectionFactory.buildList(5),
    },
  },
]
