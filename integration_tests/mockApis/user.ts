import { ProfileResponse } from '@approved-premises/api'
import { stubFor } from '../../wiremock'
import path from '../../server/paths/api'

const stubGetUserProfile = (userProfile: ProfileResponse) =>
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
      jsonBody: userProfile,
    },
  })

export default {
  stubUserProfile: (userProfile: ProfileResponse) => stubGetUserProfile(userProfile),
}
