import nock from 'nock'

import config from '../../config'
import localAuthorityFactory from '../../testutils/factories/localAuthority'
import paths from '../../paths/temporary-accommodation/api'
import LocalAuthorityClient from './localAuthorityClient'

describe('LocalAuthorityClient', () => {
  let fakeApi: nock.Scope
  let localAuthorityClient: LocalAuthorityClient

  const token = 'token-1'

  beforeEach(() => {
    config.apis.approvedPremises.url = 'http://localhost:8080'
    fakeApi = nock(config.apis.approvedPremises.url)
    localAuthorityClient = new LocalAuthorityClient(token)
  })

  afterEach(() => {
    if (!nock.isDone()) {
      nock.cleanAll()
      throw new Error('Not all nock interceptors were used!')
    }
    nock.abortPendingRequests()
    nock.cleanAll()
  })

  describe('all', () => {
    it('should get all localAuthorities', async () => {
      const localAuthorities = localAuthorityFactory.buildList(5)

      fakeApi
        .get(paths.localAuthorities.index.pattern)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, localAuthorities)

      const result = await localAuthorityClient.all()

      expect(result).toEqual(localAuthorities)
    })
  })
})
