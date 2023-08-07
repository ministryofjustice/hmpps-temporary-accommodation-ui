import { createMock } from '@golevelup/ts-jest'
import { Response } from 'express'
import type { Person } from '@approved-premises/api'

import PersonClient from '../data/personClient'
import { CallConfig } from '../data/restClient'
import {
  acctAlertFactory,
  activeOffenceFactory,
  adjudicationFactory,
  oasysSectionsFactory,
  oasysSelectionFactory,
  personFactory,
  prisonCaseNotesFactory,
  risksFactory,
} from '../testutils/factories'
import { mapApiPersonRisksForUi } from '../utils/utils'
import PersonService, { OasysNotFoundError } from './personService'
import { SanitisedError } from '../sanitisedError'

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
      const person: Person = personFactory.build()
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
      const adjudications = adjudicationFactory.buildList(3)

      personClient.adjudications.mockResolvedValue(adjudications)

      const servicePrisonCaseNotes = await service.getAdjudications(callConfig, 'crn')

      expect(servicePrisonCaseNotes).toEqual(adjudications)

      expect(personClientFactory).toHaveBeenCalledWith(callConfig)
      expect(personClient.adjudications).toHaveBeenCalledWith('crn')
    })
  })

  describe('getAcctAlerts', () => {
    it("on success returns the person's ACCT alerts given their CRN", async () => {
      const acctAlerts = acctAlertFactory.buildList(3)

      personClient.acctAlerts.mockResolvedValue(acctAlerts)

      const result = await service.getAcctAlerts(callConfig, 'crn')

      expect(result).toEqual(acctAlerts)

      expect(personClientFactory).toHaveBeenCalledWith(callConfig)
      expect(personClient.acctAlerts).toHaveBeenCalledWith('crn')
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

    it('on 404 it throws an OasysNotFoundError', async () => {
      const err = createMock<SanitisedError>({ data: { status: 404 } })
      personClient.oasysSelections.mockImplementation(() => {
        throw err
      })

      const t = () => service.getOasysSelections(callConfig, 'crn')

      await expect(t).rejects.toThrowError(OasysNotFoundError)
      await expect(t).rejects.toThrowError(`Oasys record not found for CRN: crn`)
    })

    it('on 500 it throws the error upstream', async () => {
      const err = createMock<SanitisedError>({ data: { status: 500 } })
      personClient.oasysSelections.mockImplementation(() => {
        throw err
      })

      try {
        await service.getOasysSelections(callConfig, 'crn')
      } catch (e) {
        expect(e).toEqual(err)
      }
    })

    it('on generic error it throws the error upstream', async () => {
      const genericError = new Error()
      personClient.oasysSelections.mockImplementation(() => {
        throw genericError
      })

      await expect(() => service.getOasysSelections(callConfig, 'crn')).rejects.toThrowError(Error)
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

    it('on 404 it throws an OasysNotFoundError', async () => {
      const err = createMock<SanitisedError>({ data: { status: 404 } })
      personClient.oasysSections.mockImplementation(() => {
        throw err
      })

      const t = () => service.getOasysSections(callConfig, 'crn')

      await expect(t).rejects.toThrowError(OasysNotFoundError)
      await expect(t).rejects.toThrowError(`Oasys record not found for CRN: crn`)
    })

    it('on 500 it throws the error upstream', async () => {
      const err = createMock<SanitisedError>({ data: { status: 500 } })
      personClient.oasysSections.mockImplementation(() => {
        throw err
      })

      try {
        await service.getOasysSections(callConfig, 'crn')
      } catch (e) {
        expect(e).toEqual(err)
      }
    })

    it('on generic error it throws the error upstream', async () => {
      const genericError = new Error()
      personClient.oasysSections.mockImplementation(() => {
        throw genericError
      })

      await expect(() => service.getOasysSections(callConfig, 'crn')).rejects.toThrowError(Error)
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
