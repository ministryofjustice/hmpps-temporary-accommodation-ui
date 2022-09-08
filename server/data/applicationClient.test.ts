import nock from 'nock'

import ApplicationClient from './applicationClient'
import config from '../config'
import applicationSummaryFactory from '../testutils/factories/applicationSummary'
import paths from '../paths/api'

describe('ApplicationClient', () => {
  let fakeApprovedPremisesApi: nock.Scope
  let applicationClient: ApplicationClient

  const token = 'token-1'

  beforeEach(() => {
    config.apis.approvedPremises.url = 'http://localhost:8080'
    fakeApprovedPremisesApi = nock(config.apis.approvedPremises.url)
    applicationClient = new ApplicationClient(token)
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
    it('should get all previous applications', async () => {
      const previousApplications = applicationSummaryFactory.build()

      fakeApprovedPremisesApi
        .get(paths.applications.index.pattern)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, previousApplications)

      const result = await applicationClient.all()

      expect(result).toEqual(previousApplications)
      expect(nock.isDone()).toBeTruthy()
    })
  })
})
