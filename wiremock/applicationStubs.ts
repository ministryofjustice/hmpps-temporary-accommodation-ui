import { guidRegex } from './index'

import applicationSummaryFactory from '../server/testutils/factories/applicationSummary'
import applicationFactory from '../server/testutils/factories/application'

export default [
  {
    request: {
      method: 'GET',
      url: `/applications`,
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: applicationSummaryFactory.buildList(20),
    },
  },
  {
    request: {
      method: 'GET',
      url: `/applications/${guidRegex}`,
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: applicationFactory.build(),
    },
  },
  {
    request: {
      method: 'POST',
      url: `/applications`,
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: applicationFactory.build(),
    },
  },
]
