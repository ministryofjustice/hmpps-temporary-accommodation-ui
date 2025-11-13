import { Matchers } from '@pact-foundation/pact'
import { userProfileFactory } from '../testutils/factories'
import { CallConfig } from './restClient'
import UserClient from './userClient'
import paths from '../paths/api'
import describeClient from '../testutils/describeClient'

describeClient('UserClient', provider => {
  let userClient: UserClient
  const callConfig = { token: 'some-token' } as CallConfig

  beforeEach(() => {
    userClient = new UserClient(callConfig)
  })

  describe('getUserProfile', () => {
    it('should return the profile for the current user', async () => {
      const userProfile = userProfileFactory.build()

      await provider.addInteraction({
        state: 'User exists',
        uponReceiving: 'a request for the current user profile',
        withRequest: {
          method: 'GET',
          path: paths.users.actingUser.profile({}),
          headers: {
            authorization: `Bearer ${callConfig.token}`,
            'X-Service-Name': 'temporary-accommodation',
          },
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: Matchers.like(userProfile),
        },
      })

      const result = await userClient.getUserProfile()
      expect(result).toEqual(userProfile)
    })
  })
})
