import { User } from '../../server/@types/shared'
import { stubFor } from '../../wiremock'
import path from '../../server/paths/api'

const stubGetActingUser = (user: User) =>
  stubFor({
    request: {
      method: 'GET',
      urlPath: path.users.actingUser.profile({}),
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: user,
    },
  })

const stubGetUserById = (user: User) =>
  stubFor({
    request: {
      method: 'GET',
      urlPath: path.users.actingUser.show({ id: user.id }),
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: user,
    },
  })

export default {
  stubActingUser: (user: User) => stubGetActingUser(user),
  stubGetUserById: (user: User) => stubGetUserById(user),
}
