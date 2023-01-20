import nock from 'nock'

import config from '../config'
import UserClient from './userClient'
import userFactory from '../testutils/factories/user'
import paths from '../paths/api'
import { createMockRequest } from '../testutils/createMockRequest'

describe('UserClient', () => {
  let fakeApprovedPremisesApi: nock.Scope
  let userClient: UserClient

  const request = createMockRequest()

  beforeEach(() => {
    config.apis.approvedPremises.url = 'http://localhost:8080'
    fakeApprovedPremisesApi = nock(config.apis.approvedPremises.url)
    userClient = new UserClient(request)
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
        .get(paths.users.actingUser.show({}))
        .matchHeader('authorization', `Bearer ${request.user.token}`)
        .reply(200, user)

      const result = await userClient.getActingUser()

      expect(result).toEqual(user)
      expect(nock.isDone()).toBeTruthy()
    })
  })
})
