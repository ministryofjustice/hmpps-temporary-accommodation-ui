import { faker } from '@faker-js/faker/.'
import { Cas3SubmitApplication, Cas3UpdateApplication } from '../@types/shared'
import paths from '../paths/api'
import { activeOffenceFactory, cas3ApplicationFactory, cas3ApplicationSummaryFactory } from '../testutils/factories'
import ApplicationClient from './applicationClient'
import { CallConfig } from './restClient'
import describeClient from '../testutils/describeClient'
import config from '../config'

describeClient('ApplicationClient', provider => {
  let applicationClient: ApplicationClient
  let originalFlagOasysDisabled: boolean
  const callConfig = { token: 'some-token' } as CallConfig

  beforeEach(() => {
    applicationClient = new ApplicationClient(callConfig)
    originalFlagOasysDisabled = config.flags.oasysDisabled as boolean
  })

  afterEach(() => {
    config.flags.oasysDisabled = originalFlagOasysDisabled
  })

  describe('create', () => {
    it('should return an application when a crn is posted', async () => {
      const application = cas3ApplicationFactory.build()
      const offence = activeOffenceFactory.build()
      config.flags.oasysDisabled = false

      await provider.addInteraction({
        state: 'Application can be created',
        uponReceiving: 'a request to create an application',
        withRequest: {
          method: 'POST',
          path: paths.applications.new.pattern,
          query: { createWithRisks: 'true' },
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
          body: {
            crn: application.person.crn,
            convictionId: offence.convictionId,
            deliusEventNumber: offence.deliusEventNumber,
            offenceId: offence.offenceId,
          },
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: application,
        },
      })

      const result = await applicationClient.create(application.person.crn, offence)
      expect(result).toEqual(application)
    })

    it('should request that the risks are skipped when oasys integration is disabled', async () => {
      const application = cas3ApplicationFactory.build()
      const offence = activeOffenceFactory.build()
      config.flags.oasysDisabled = true

      await provider.addInteraction({
        state: 'Application can be created with risks skipped',
        uponReceiving: 'a request to create an application with risks skipped',
        withRequest: {
          method: 'POST',
          path: paths.applications.new.pattern,
          query: { createWithRisks: 'false' },
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
          body: {
            crn: application.person.crn,
            convictionId: offence.convictionId,
            deliusEventNumber: offence.deliusEventNumber,
            offenceId: offence.offenceId,
          },
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: application,
        },
      })

      const result = await applicationClient.create(application.person.crn, offence)
      expect(result).toEqual(application)
    })
  })

  describe('find', () => {
    it('should return an application', async () => {
      const application = cas3ApplicationFactory.build()

      await provider.addInteraction({
        state: 'Application exists',
        uponReceiving: 'a request to get an application',
        withRequest: {
          method: 'GET',
          path: paths.applications.show({ id: application.id }),
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: application,
        },
      })

      const result = await applicationClient.find(application.id)
      expect(result).toEqual(application)
    })
  })

  describe('update', () => {
    it('should return an application when a PUT request is made', async () => {
      const application = cas3ApplicationFactory.build()
      const data: Cas3UpdateApplication = {
        data: application.data,
      }

      await provider.addInteraction({
        state: 'Application can be updated',
        uponReceiving: 'a request to update an application',
        withRequest: {
          method: 'PUT',
          path: paths.applications.update({ id: application.id }),
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
          body: data,
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: application,
        },
      })

      const result = await applicationClient.update(application.id, data)
      expect(result).toEqual(application)
    })
  })

  describe('all', () => {
    it('should get all previous applications', async () => {
      const previousApplicationSummaries = cas3ApplicationSummaryFactory.buildList(3)

      await provider.addInteraction({
        state: 'Previous applications exist',
        uponReceiving: 'a request for all previous applications',
        withRequest: {
          method: 'GET',
          path: paths.applications.index.pattern,
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: previousApplicationSummaries,
        },
      })

      const result = await applicationClient.all()
      expect(result).toEqual(previousApplicationSummaries)
    })
  })

  describe('submit', () => {
    it('should submit the application', async () => {
      const application = cas3ApplicationFactory.build()
      const data: Cas3SubmitApplication = {
        arrivalDate: '2020-01-01',
        summaryData: {},
        probationDeliveryUnitId: faker.string.uuid(),
      }

      await provider.addInteraction({
        state: 'Application can be submitted',
        uponReceiving: 'a request to submit an application',
        withRequest: {
          method: 'POST',
          path: paths.applications.submission({ id: application.id }),
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
          body: data,
        },
        willRespondWith: {
          status: 200,
        },
      })

      await applicationClient.submit(application.id, data)
    })
  })

  describe('delete', () => {
    it('should delete an application when a DELETE request is made', async () => {
      const application = cas3ApplicationFactory.build()

      await provider.addInteraction({
        state: 'Application can be deleted',
        uponReceiving: 'a request to delete an application',
        withRequest: {
          method: 'DELETE',
          path: paths.applications.delete({ id: application.id }),
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
        },
        willRespondWith: {
          status: 200,
        },
      })

      const result = await applicationClient.delete(application.id)
      expect(result).toEqual({})
    })
  })
})
