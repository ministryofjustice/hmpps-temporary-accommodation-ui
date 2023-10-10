import nock from 'nock'

import config from '../config'
import paths from '../paths/api'
import { userFactory } from '../testutils/factories'
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

  describe('getActingUser', () => {
    it('should return the acting user', async () => {
      const user = userFactory.build()

      fakeApprovedPremisesApi
        .get(paths.users.actingUser.profile({}))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200, user)

      const result = await userClient.getActingUser()

      expect(result).toEqual(user)
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('getUserById', () => {
    it('should return the acting user', async () => {
      const user = userFactory.build()

      fakeApprovedPremisesApi
        .get(paths.users.actingUser.show({ id: user.id }))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200, user)

      const result = await userClient.getUserById(user.id)

      expect(result).toEqual(user)
      expect(nock.isDone()).toBeTruthy()
    })
  })
})
