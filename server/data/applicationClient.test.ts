import nock from 'nock'

import ApplicationClient from './applicationClient'
import config from '../config'
import applicationSummaryFactory from '../testutils/factories/applicationSummary'
import applicationFactory from '../testutils/factories/application'
import paths from '../paths/api'
import { createMockRequest } from '../testutils/createMockRequest'

describe('ApplicationClient', () => {
  let fakeApprovedPremisesApi: nock.Scope
  let applicationClient: ApplicationClient

  const request = createMockRequest()

  beforeEach(() => {
    config.apis.approvedPremises.url = 'http://localhost:8080'
    fakeApprovedPremisesApi = nock(config.apis.approvedPremises.url)
    applicationClient = new ApplicationClient(request)
  })

  afterEach(() => {
    if (!nock.isDone()) {
      nock.cleanAll()
      throw new Error('Not all nock interceptors were used!')
    }
    nock.abortPendingRequests()
    nock.cleanAll()
  })

  describe('create', () => {
    it('should return an application when a crn is posted', async () => {
      const application = applicationFactory.build()

      fakeApprovedPremisesApi
        .post(paths.applications.new.pattern)
        .matchHeader('authorization', `Bearer ${request.user.token}`)
        .reply(201, application)

      const result = await applicationClient.create(application.person.crn)

      expect(result).toEqual(application)
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('find', () => {
    it('should return an application', async () => {
      const application = applicationFactory.build()

      fakeApprovedPremisesApi
        .get(paths.applications.show({ id: application.id }))
        .matchHeader('authorization', `Bearer ${request.user.token}`)
        .reply(200, application)

      const result = await applicationClient.find(application.id)

      expect(result).toEqual(application)
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('update', () => {
    it('should return an application when a PUT request is made', async () => {
      const application = applicationFactory.build()

      fakeApprovedPremisesApi
        .put(paths.applications.update({ id: application.id }), JSON.stringify({ data: application.data }))
        .matchHeader('authorization', `Bearer ${request.user.token}`)
        .reply(200, application)

      const result = await applicationClient.update(application)

      expect(result).toEqual(application)
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('all', () => {
    it('should get all previous applications', async () => {
      const previousApplications = applicationSummaryFactory.build()

      fakeApprovedPremisesApi
        .get(paths.applications.index.pattern)
        .matchHeader('authorization', `Bearer ${request.user.token}`)
        .reply(200, previousApplications)

      const result = await applicationClient.all()

      expect(result).toEqual(previousApplications)
      expect(nock.isDone()).toBeTruthy()
    })
  })
})
