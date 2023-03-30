import paths from '../server/paths/api'
import { userFactory } from '../server/testutils/factories'

const userStubs: Array<Record<string, unknown>> = []

userStubs.push({
  request: {
    method: 'GET',
    urlPath: paths.users.actingUser.show({}),
  },
  response: {
    status: 200,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    jsonBody: userFactory.build(),
  },
})

export default userStubs
