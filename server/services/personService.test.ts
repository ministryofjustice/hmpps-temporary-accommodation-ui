import type { Person } from '@approved-premises/api'
import { Response } from 'express'
import { createMock } from '@golevelup/ts-jest'

import PersonService from './personService'
import PersonClient from '../data/personClient'
import PersonFactory from '../testutils/factories/person'
import risksFactory from '../testutils/factories/risks'
import { mapApiPersonRisksForUi } from '../utils/utils'
import prisonCaseNotesFactory from '../testutils/factories/prisonCaseNotes'
import adjudicationsFactory from '../testutils/factories/adjudication'
import activeOffenceFactory from '../testutils/factories/activeOffence'
import oasysSelectionFactory from '../testutils/factories/oasysSelection'
import oasysSectionsFactory from '../testutils/factories/oasysSections'
import { CallConfig } from '../data/restClient'

jest.mock('../data/personClient.ts')

describe('PersonService', () => {
  const personClient = new PersonClient(null) as jest.Mocked<PersonClient>
  const personClientFactory = jest.fn()

  const service = new PersonService(personClientFactory)

  const callConfig = { token: 'some-token' } as CallConfig

  beforeEach(() => {
    jest.resetAllMocks()
    personClientFactory.mockReturnValue(personClient)
  })

  describe('findByCrn', () => {
    it('on success returns the person given their CRN', async () => {
      const person: Person = PersonFactory.build()
      personClient.search.mockResolvedValue(person)

      const postedPerson = await service.findByCrn(callConfig, 'crn')

      expect(postedPerson).toEqual(person)

      expect(personClientFactory).toHaveBeenCalledWith(callConfig)
      expect(personClient.search).toHaveBeenCalledWith('crn')
    })
  })

  describe('getOffences', () => {
    it('on success returns the offences for a person given their CRN', async () => {
      const offences = activeOffenceFactory.buildList(2)
      personClient.offences.mockResolvedValue(offences)

      const result = await service.getOffences(callConfig, 'crn')

      expect(result).toEqual(offences)

      expect(personClientFactory).toHaveBeenCalledWith(callConfig)
      expect(personClient.offences).toHaveBeenCalledWith('crn')
    })
  })

  describe('getPersonRisks', () => {
    it("on success returns the person's risks given their CRN", async () => {
      const apiRisks = risksFactory.build()
      const uiRisks = mapApiPersonRisksForUi(apiRisks)
      personClient.risks.mockResolvedValue(apiRisks)

      const postedPerson = await service.getPersonRisks(callConfig, 'crn')

      expect(postedPerson).toEqual(uiRisks)

      expect(personClientFactory).toHaveBeenCalledWith(callConfig)
      expect(personClient.risks).toHaveBeenCalledWith('crn')
    })
  })

  describe('getPrisonCaseNotes', () => {
    it("on success returns the person's prison case notes given their CRN", async () => {
      const prisonCaseNotes = prisonCaseNotesFactory.buildList(3)

      personClient.prisonCaseNotes.mockResolvedValue(prisonCaseNotes)

      const servicePrisonCaseNotes = await service.getPrisonCaseNotes(callConfig, 'crn')

      expect(servicePrisonCaseNotes).toEqual(prisonCaseNotes)

      expect(personClientFactory).toHaveBeenCalledWith(callConfig)
      expect(personClient.prisonCaseNotes).toHaveBeenCalledWith('crn')
    })
  })

  describe('getAdjudications', () => {
    it("on success returns the person's adjudications notes given their CRN", async () => {
      const adjudications = adjudicationsFactory.buildList(3)

      personClient.adjudications.mockResolvedValue(adjudications)

      const servicePrisonCaseNotes = await service.getAdjudications(callConfig, 'crn')

      expect(servicePrisonCaseNotes).toEqual(adjudications)

      expect(personClientFactory).toHaveBeenCalledWith(callConfig)
      expect(personClient.adjudications).toHaveBeenCalledWith('crn')
    })
  })

  describe('getOasysSelections', () => {
    it("on success returns the person's OASys selections given their CRN", async () => {
      const oasysSelections = oasysSelectionFactory.buildList(3)

      personClient.oasysSelections.mockResolvedValue(oasysSelections)

      const serviceOasysSelections = await service.getOasysSelections(callConfig, 'crn')

      expect(serviceOasysSelections).toEqual(oasysSelections)

      expect(personClientFactory).toHaveBeenCalledWith(callConfig)
      expect(personClient.oasysSelections).toHaveBeenCalledWith('crn')
    })
  })

  describe('getOasysSections', () => {
    it("on success returns the person's OASys selections given their CRN", async () => {
      const oasysSections = oasysSectionsFactory.build()

      personClient.oasysSections.mockResolvedValue(oasysSections)

      const serviceOasysSections = await service.getOasysSections(callConfig, 'crn')

      expect(serviceOasysSections).toEqual(oasysSections)

      expect(personClientFactory).toHaveBeenCalledWith(callConfig)
      expect(personClient.oasysSections).toHaveBeenCalledWith('crn', [])
    })
  })

  describe('getDocument', () => {
    it('pipes the document to the response', async () => {
      const response = createMock<Response>({})
      await service.getDocument(callConfig, 'crn', 'applicationId', response)

      expect(personClientFactory).toHaveBeenCalledWith(callConfig)
      expect(personClient.document).toHaveBeenCalledWith('crn', 'applicationId', response)
    })
  })
})
