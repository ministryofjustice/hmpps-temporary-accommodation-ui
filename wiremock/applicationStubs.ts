import { guidRegex } from './index'

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
      jsonBody: applicationFactory.buildList(20),
    },
  },
  {
    request: {
      method: 'GET',
      urlPathPattern: `/applications/${guidRegex}`,
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
