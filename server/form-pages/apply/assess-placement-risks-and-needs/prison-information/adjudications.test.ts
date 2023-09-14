import { createMock } from '@golevelup/ts-jest'
import { CallConfig } from '../../../../data/restClient'
import { PersonService } from '../../../../services'
import { adjudicationFactory, applicationFactory, personFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import { PageBodyAdjudication, mapAdjudicationsForPageBody } from '../../../utils'
import Adjudications, { adjudicationResponse } from './adjudications'
import { SanitisedError } from '../../../../sanitisedError'

jest.mock('../../../../services/personService')
jest.mock('../../../utils')

describe('adjudicationResponse', () => {
  it('returns a response for an adjudication', () => {
    const adjudication = adjudicationFactory.build({
      id: 123,
      reportedAt: '2022-01-01T10:00:00Z',
      establishment: 'Some establishment',
      offenceDescription: 'Description',
      finding: 'NOT_PROVED',
    })

    expect(adjudicationResponse(adjudication)).toEqual({
      'Adjudication number': 123,
      Establishment: 'Some establishment',
      Finding: 'Not proved',
      'Offence description': 'Description',
      'Report date and time': '1 Jan 2022, 10:00',
    })
  })
})

describe('Adjudications', () => {
  const callConfig = { token: 'some-call-config-token' } as CallConfig
  const person = personFactory.build({ name: 'John Wayne' })
  const application = applicationFactory.build({ person })

  const adjudications = adjudicationFactory.buildList(5) as Array<PageBodyAdjudication>

  const body = { adjudications }

  describe('body', () => {
    it('sets the body', () => {
      const page = new Adjudications(body, application)

      expect(page.body).toEqual(body)
    })
  })

  describe('initialize', () => {
    it('populates the body with the results of getAdjudications and mapAdjudicationsForPageBody', async () => {
      const apiAdjudications = adjudicationFactory.buildList(5)

      const getAdjudicationsMock = jest.fn().mockResolvedValue(apiAdjudications)
      ;(mapAdjudicationsForPageBody as jest.MockedFunction<typeof mapAdjudicationsForPageBody>).mockReturnValue(
        adjudications,
      )

      const personService = createMock<PersonService>({
        getAdjudications: getAdjudicationsMock,
      })

      const page = await Adjudications.initialize({}, application, callConfig, { personService })

      expect(page.body).toEqual({ adjudications })

      expect(getAdjudicationsMock).toHaveBeenCalledWith(callConfig, application.person.crn)
      expect(mapAdjudicationsForPageBody).toHaveBeenCalledWith(apiAdjudications)
    })

    it('sets the number of adjudications to 0 if none are found', async () => {
      const err = <SanitisedError>{ data: { status: 404 } }
      const getAdjudicationsMock = jest.fn().mockImplementation(() => {
        throw err
      })

      const personService = createMock<PersonService>({
        getAdjudications: getAdjudicationsMock,
      })

      const page = await Adjudications.initialize({}, application, callConfig, { personService })

      expect(page.body).toEqual({ adjudications })

      expect(getAdjudicationsMock).toHaveBeenCalledWith(callConfig, application.person.crn)
      expect(mapAdjudicationsForPageBody).toHaveBeenCalledWith([])
    })
  })

  itShouldHavePreviousValue(new Adjudications({}, application), 'dashboard')
  itShouldHaveNextValue(new Adjudications({}, application), 'acct-alerts')

  describe('response', () => {
    it('returns the adjucications', () => {
      const page = new Adjudications(body, application)

      expect(page.response()).toEqual({
        Adjudications: [
          adjudicationResponse(adjudications[0]),
          adjudicationResponse(adjudications[1]),
          adjudicationResponse(adjudications[2]),
          adjudicationResponse(adjudications[3]),
          adjudicationResponse(adjudications[4]),
        ],
      })
    })

    it('returns a message when there are no adjudications', () => {
      const page = new Adjudications({ adjudications: [] }, application)

      expect(page.response()).toEqual({
        Adjudications: 'No adjudication information available for the person at the time of referral',
      })
    })
  })

  describe('errors', () => {
    expect(new Adjudications({}, application).errors()).toEqual({})
  })
})
