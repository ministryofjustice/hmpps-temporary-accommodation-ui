import nock from 'nock'

import config from '../config'
import paths from '../paths/api'
import { userProfileFactory } from '../testutils/factories'
import { CallConfig } from './restClient'
import UserClient from './userClient'

describe('UserClient', () => {
  let fakeApprovedPremisesApi: nock.Scope
  let userClient: UserClient

  const callConfig = { token: 'some-token' } as CallConfig

  beforeEach(() => {
    config.apis.approvedPremises.url = 'http://localhost:8080'
    fakeApprovedPremisesApi = nock(config.apis.approvedPremises.url)
    userClient = new UserClient(callConfig)
  })

  afterEach(() => {
    if (!nock.isDone()) {
      nock.cleanAll()
      throw new Error('Not all nock interceptors were used!')
    }
    nock.abortPendingRequests()
    nock.cleanAll()
  })

  describe('getUserProfile', () => {
    it('should return the profile for the current user', async () => {
      const userProfile = userProfileFactory.build()

      fakeApprovedPremisesApi
        .get(paths.users.actingUser.profile({}))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200, userProfile)

      const result = await userClient.getUserProfile()

      expect(result).toEqual(userProfile)
      expect(nock.isDone()).toBeTruthy()
    })
  })
})
