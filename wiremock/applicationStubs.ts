import { guidRegex } from './index'

import applicationFactory from '../server/testutils/factories/application'
import paths from '../server/paths/api'

export default [
  {
    request: {
      method: 'GET',
      url: paths.applications.index({}),
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
      urlPathPattern: paths.applications.show({ id: guidRegex }),
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
      urlPath: paths.applications.index({}),
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: applicationFactory.build(),
    },
  },
  {
    request: {
      method: 'PUT',
      urlPathPattern: paths.applications.show({ id: guidRegex }),
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
      urlPathPattern: paths.applications.submission({ id: guidRegex }),
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: {},
    },
  },
]
