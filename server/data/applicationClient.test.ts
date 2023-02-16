import nock from 'nock'

import ApplicationClient from './applicationClient'
import config from '../config'
import applicationFactory from '../testutils/factories/application'
import activeOffenceFactory from '../testutils/factories/activeOffence'
import documentFactory from '../testutils/factories/document'
import paths from '../paths/api'
import { CallConfig } from './restClient'

describe('ApplicationClient', () => {
  let fakeApprovedPremisesApi: nock.Scope
  let applicationClient: ApplicationClient

  const callConfig = { token: 'some-token' } as CallConfig

  beforeEach(() => {
    config.apis.approvedPremises.url = 'http://localhost:8080'
    config.flags.oasysDisabled = false
    fakeApprovedPremisesApi = nock(config.apis.approvedPremises.url)
    applicationClient = new ApplicationClient(callConfig)
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
      const offence = activeOffenceFactory.build()

      fakeApprovedPremisesApi
        .post(`${paths.applications.new.pattern}?createWithRisks=true`, {
          crn: application.person.crn,
          convictionId: offence.convictionId,
          deliusEventNumber: offence.deliusEventNumber,
          offenceId: offence.offenceId,
        })
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(201, application)

      const result = await applicationClient.create(application.person.crn, offence)

      expect(result).toEqual(application)
      expect(nock.isDone()).toBeTruthy()
    })

    describe('when oasys integration is disabled', () => {
      beforeEach(() => {
        config.flags.oasysDisabled = true
      })

      it('should request that the risks are skipped', async () => {
        const application = applicationFactory.build()
        const offence = activeOffenceFactory.build()

        fakeApprovedPremisesApi
          .post(`${paths.applications.new.pattern}?createWithRisks=false`, {
            crn: application.person.crn,
            convictionId: offence.convictionId,
            deliusEventNumber: offence.deliusEventNumber,
            offenceId: offence.offenceId,
          })
          .matchHeader('authorization', `Bearer ${callConfig.token}`)
          .reply(201, application)

        const result = await applicationClient.create(application.person.crn, offence)

        expect(result).toEqual(application)
        expect(nock.isDone()).toBeTruthy()
      })
    })
  })

  describe('find', () => {
    it('should return an application', async () => {
      const application = applicationFactory.build()

      fakeApprovedPremisesApi
        .get(paths.applications.show({ id: application.id }))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200, application)

      const result = await applicationClient.find(application.id)

      expect(result).toEqual(application)
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('update', () => {
    it('should return an application when a PUT request is made', async () => {
      const application = applicationFactory.withData().build()

      fakeApprovedPremisesApi
        .put(paths.applications.update({ id: application.id }), JSON.stringify({ data: application.data }))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200, application)

      const result = await applicationClient.update(application)

      expect(result).toEqual(application)
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('all', () => {
    it('should get all previous applications', async () => {
      const previousApplications = applicationFactory.build()

      fakeApprovedPremisesApi
        .get(paths.applications.index.pattern)
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200, previousApplications)

      const result = await applicationClient.all()

      expect(result).toEqual(previousApplications)
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('submit', () => {
    it('should submit the application', async () => {
      const application = applicationFactory.withData().build()

      fakeApprovedPremisesApi
        .post(
          paths.applications.submission({ id: application.id }),
          JSON.stringify({ translatedDocument: application.document }),
        )
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(201)

      await applicationClient.submit(application)

      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('documents', () => {
    it('should return documents for an application', async () => {
      const application = applicationFactory.build()
      const documents = documentFactory.buildList(5)

      fakeApprovedPremisesApi
        .get(paths.applications.documents({ id: application.id }))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200, documents)

      const result = await applicationClient.documents(application)

      expect(result).toEqual(documents)
      expect(nock.isDone()).toBeTruthy()
    })
  })
})
