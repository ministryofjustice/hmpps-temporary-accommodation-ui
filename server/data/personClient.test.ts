import nock from 'nock'
import { Response } from 'express'
import { createMock } from '@golevelup/ts-jest'

import PersonClient from './personClient'
import config from '../config'
import riskFactory from '../testutils/factories/risks'
import personFactory from '../testutils/factories/person'
import prisonCaseNotesFactory from '../testutils/factories/prisonCaseNotes'
import paths from '../paths/api'
import adjudicationsFactory from '../testutils/factories/adjudication'
import activeOffenceFactory from '../testutils/factories/activeOffence'
import oasysSelectionFactory from '../testutils/factories/oasysSelection'
import oasysSectionsFactory from '../testutils/factories/oasysSections'

import oasysStubs from './stubs/oasysStubs.json'
import { CallConfig } from './restClient'

describe('PersonClient', () => {
  let fakeApprovedPremisesApi: nock.Scope
  let personClient: PersonClient

  const callConfig = { token: 'some-token' } as CallConfig

  beforeEach(() => {
    config.apis.approvedPremises.url = 'http://localhost:8080'
    config.flags.oasysDisabled = false
    fakeApprovedPremisesApi = nock(config.apis.approvedPremises.url)
    personClient = new PersonClient(callConfig)
  })

  afterEach(() => {
    if (!nock.isDone()) {
      nock.cleanAll()
      throw new Error('Not all nock interceptors were used!')
    }
    nock.abortPendingRequests()
    nock.cleanAll()
  })

  describe('search', () => {
    it('should return a person', async () => {
      const person = personFactory.build()

      fakeApprovedPremisesApi
        .get(`/people/search?crn=crn`)
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(201, person)

      const result = await personClient.search('crn')

      expect(result).toEqual(person)
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('risks', () => {
    it('should return the risks for a person', async () => {
      const crn = 'crn'
      const person = riskFactory.build()

      fakeApprovedPremisesApi
        .get(`/people/${crn}/risks`)
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(201, person)

      const result = await personClient.risks(crn)

      expect(result).toEqual(person)
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('prison case notes', () => {
    it('should return the risks for a person', async () => {
      const crn = 'crn'
      const prisonCaseNotes = prisonCaseNotesFactory.build()

      fakeApprovedPremisesApi
        .get(paths.people.prisonCaseNotes({ crn }))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(201, prisonCaseNotes)

      const result = await personClient.prisonCaseNotes(crn)

      expect(result).toEqual(prisonCaseNotes)
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('adjudications', () => {
    it('should return the adjudications for a person', async () => {
      const crn = 'crn'
      const adjudications = adjudicationsFactory.buildList(5)

      fakeApprovedPremisesApi
        .get(paths.people.adjudications({ crn }))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(201, adjudications)

      const result = await personClient.adjudications(crn)

      expect(result).toEqual(adjudications)
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('oasysSelection', () => {
    it('should return the importable sections of OASys', async () => {
      const crn = 'crn'
      const oasysSections = oasysSelectionFactory.buildList(5)

      fakeApprovedPremisesApi
        .get(paths.people.oasys.selection({ crn }))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(201, oasysSections)

      const result = await personClient.oasysSelections(crn)

      expect(result).toEqual(oasysSections)
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('oasysSection', () => {
    it('should return the sections of OASys when there is optional selected sections', async () => {
      const crn = 'crn'
      const optionalSections = [1, 2, 3]
      const oasysSections = oasysSectionsFactory.build()

      fakeApprovedPremisesApi
        .get(`${paths.people.oasys.sections({ crn })}?selected-sections=1&selected-sections=2&selected-sections=3`)
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(201, oasysSections)

      const result = await personClient.oasysSections(crn, optionalSections)

      expect(result).toEqual(oasysSections)
      expect(nock.isDone()).toBeTruthy()
    })

    it('should return the sections of OASys with no optional selected sections', async () => {
      const crn = 'crn'
      const oasysSections = oasysSectionsFactory.build()

      fakeApprovedPremisesApi
        .get(`${paths.people.oasys.sections({ crn })}`)
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(201, oasysSections)

      const result = await personClient.oasysSections(crn)

      expect(result).toEqual(oasysSections)
      expect(nock.isDone()).toBeTruthy()
    })

    describe('when oasys integration is disabled', () => {
      beforeEach(() => {
        config.flags.oasysDisabled = true
      })

      afterEach(() => {
        nock.abortPendingRequests()
        nock.cleanAll()
      })

      it('should return the stub dataset with blank responses', async () => {
        const crn = 'crn'
        const url = `${paths.people.oasys.sections({ crn })}`

        fakeApprovedPremisesApi.get(url).matchHeader('authorization', `Bearer ${callConfig.token}`).reply(200)

        const result = await personClient.oasysSections(crn)

        expect(result).toEqual(oasysStubs)

        expect(nock.isDone()).toBeFalsy()
        expect(nock.pendingMocks()).toEqual([`GET ${config.apis.approvedPremises.url}${url}`])
      })
    })
  })

  describe('offences', () => {
    it('should return the offences for a person', async () => {
      const crn = 'crn'
      const offences = activeOffenceFactory.buildList(5)

      fakeApprovedPremisesApi
        .get(paths.people.offences({ crn }))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(201, offences)

      const result = await personClient.offences(crn)

      expect(result).toEqual(offences)
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('document', () => {
    it('should pipe the document from the API', async () => {
      const crn = 'crn'
      const documentId = '123'
      const response = createMock<Response>({})

      fakeApprovedPremisesApi
        .get(paths.people.documents({ crn, documentId }))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200)

      await personClient.document(crn, documentId, response)

      expect(nock.isDone()).toBeTruthy()
    })
  })
})
