import paths from '../paths/api'
import {
  acctAlertFactory,
  activeOffenceFactory,
  adjudicationFactory,
  oasysSectionsFactory,
  personFactory,
  prisonCaseNotesFactory,
} from '../testutils/factories'
import PersonClient from './personClient'
import { CallConfig } from './restClient'
import describeClient from '../testutils/describeClient'
import oasysStubs from './stubs/oasysStubs.json'

describeClient('PersonClient', provider => {
  let personClient: PersonClient
  const callConfig = { token: 'some-token' } as CallConfig

  beforeEach(() => {
    personClient = new PersonClient(callConfig)
  })

  describe('search', () => {
    it('should return a person', async () => {
      const person = personFactory.build()

      await provider.addInteraction({
        state: 'Person exists',
        uponReceiving: 'a request to search for a person',
        withRequest: {
          method: 'GET',
          path: '/people/search',
          query: { crn: person.crn },
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: { crn: person.crn, type: person.type },
        },
      })

      const result = await personClient.search(person.crn)
      expect(result).toEqual({ crn: person.crn, type: person.type })
    })
  })

  describe('prison case notes', () => {
    it('should return the prison case notes for a person', async () => {
      const crn = 'crn'
      const prisonCaseNotes = [prisonCaseNotesFactory.build()]

      await provider.addInteraction({
        state: 'Prison case notes exist for person',
        uponReceiving: 'a request for prison case notes',
        withRequest: {
          method: 'GET',
          path: paths.people.prisonCaseNotes({ crn }),
          headers: {
            authorization: `Bearer ${callConfig.token}`,
            'X-Service-Name': 'temporary-accommodation',
          },
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: prisonCaseNotes,
        },
      })

      const result = await personClient.prisonCaseNotes(crn)
      expect(result).toEqual(prisonCaseNotes)
    })
  })

  describe('adjudications', () => {
    it('should return the adjudications for a person', async () => {
      const crn = 'crn'
      const adjudications = adjudicationFactory.buildList(5)

      await provider.addInteraction({
        state: 'Adjudications exist for person',
        uponReceiving: 'a request for adjudications',
        withRequest: {
          method: 'GET',
          path: paths.people.adjudications({ crn }),
          headers: {
            authorization: `Bearer ${callConfig.token}`,
            'X-Service-Name': 'temporary-accommodation',
          },
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: adjudications,
        },
      })

      const result = await personClient.adjudications(crn)
      expect(result).toEqual(adjudications)
    })
  })

  describe('acctAlerts', () => {
    it('should return the ACCT alerts for a person', async () => {
      const crn = 'crn'
      const acctAlerts = acctAlertFactory.buildList(5)

      await provider.addInteraction({
        state: 'ACCT alerts exist for person',
        uponReceiving: 'a request for ACCT alerts',
        withRequest: {
          method: 'GET',
          path: paths.people.acctAlerts({ crn }),
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: acctAlerts,
        },
      })

      const result = await personClient.acctAlerts(crn)
      expect(result).toEqual(acctAlerts)
    })
  })

  describe('oasysSections', () => {
    it('should return the sections of OASys when there is optional selected sections', async () => {
      const crn = 'crn'
      const optionalSections = [1, 2, 3]
      const oasysSections = oasysSectionsFactory.build()

      await provider.addInteraction({
        state: 'OASys sections exist for person',
        uponReceiving: 'a request for OASys sections with selected sections',
        withRequest: {
          method: 'GET',
          path: paths.people.oasys.sections({ crn }),
          query: { 'selected-sections': ['1', '2', '3'] },
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: oasysSections,
        },
      })

      const result = await personClient.oasysSections(crn, optionalSections)
      expect(result).toEqual(oasysSections)
    })

    it('should return the sections of OASys with no optional selected sections', async () => {
      const crn = 'crn'
      const oasysSections = oasysSectionsFactory.build()

      await provider.addInteraction({
        state: 'OASys sections exist for person',
        uponReceiving: 'a request for OASys sections with no selected sections',
        withRequest: {
          method: 'GET',
          path: paths.people.oasys.sections({ crn }),
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: oasysSections,
        },
      })

      const result = await personClient.oasysSections(crn)
      expect(result).toEqual(oasysSections)
    })
  })

  describe('offences', () => {
    it('should return the offences for a person', async () => {
      const crn = 'crn'
      const offences = activeOffenceFactory.buildList(5)

      await provider.addInteraction({
        state: 'Offences exist for person',
        uponReceiving: 'a request for offences',
        withRequest: {
          method: 'GET',
          path: paths.people.offences({ crn }),
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: offences,
        },
      })

      const result = await personClient.offences(crn)
      expect(result).toEqual(offences)
    })
  })
})

describe('PersonClient oasysSections when integration is disabled', () => {
  let personClient: PersonClient
  const callConfig = { token: 'some-token' } as CallConfig

  beforeEach(() => {
    personClient = new PersonClient(callConfig)
    jest.spyOn(personClient, 'oasysSections').mockResolvedValue(oasysStubs)
  })

  it('should return the stub dataset with blank responses', async () => {
    const crn = 'crn'
    const result = await personClient.oasysSections(crn)
    expect(result).toEqual(oasysStubs)
  })
})
