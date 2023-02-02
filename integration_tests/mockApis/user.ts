import { User } from '../../server/@types/shared'
import { stubFor } from '../../wiremock'
import path from '../../server/paths/api'

const stubGetActingUser = (user: User) =>
  stubFor({
    request: {
      method: 'GET',
      urlPath: path.users.actingUser.show({}),
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
}
