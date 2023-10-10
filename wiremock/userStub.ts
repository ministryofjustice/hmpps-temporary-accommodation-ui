import paths from '../server/paths/api'
import { guidRegex } from './index'
import { userFactory } from '../server/testutils/factories'

const userStubs: Array<Record<string, unknown>> = []

userStubs.push({
  request: {
    method: 'GET',
    urlPath: paths.users.actingUser.profile({}),
  },
  response: {
    status: 200,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    jsonBody: userFactory.build({
      roles: ['assessor', 'referrer'],
    }),
  },
})

userStubs.push({
  request: {
    method: 'GET',
    urlPathPattern: paths.users.actingUser.show({ id: guidRegex }),
  },
  response: {
    status: 200,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    jsonBody: userFactory.build({
      roles: ['assessor', 'referrer'],
    }),
  },
})

export default userStubs
