import nock from 'nock'

import { SubmitApplication, UpdateApplication } from '../@types/shared'
import config from '../config'
import paths from '../paths/api'
import { activeOffenceFactory, applicationFactory } from '../testutils/factories'
import ApplicationClient from './applicationClient'
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
      const application = applicationFactory.build()
      const data: UpdateApplication = {
        data: application.data,
        type: 'CAS3',
      }

      fakeApprovedPremisesApi
        .put(paths.applications.update({ id: application.id }), JSON.stringify({ ...data, type: 'CAS3' }))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200, application)

      const result = await applicationClient.update(application.id, data)

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
      const application = applicationFactory.build()
      const data: SubmitApplication = {
        translatedDocument: application.document,
        type: 'CAS3',
      }

      fakeApprovedPremisesApi
        .post(paths.applications.submission({ id: application.id }), JSON.stringify({ ...data, type: 'CAS3' }))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(201)

      await applicationClient.submit(application.id, data)

      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('delete', () => {
    it('should delete an application when a DELETE request is made', async () => {
      const application = applicationFactory.build()

      fakeApprovedPremisesApi
        .delete(paths.applications.delete({ id: application.id }))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200)

      const result = await applicationClient.delete(application.id)

      expect(result).toEqual({})
      expect(nock.isDone()).toBeTruthy()
    })
  })
})
