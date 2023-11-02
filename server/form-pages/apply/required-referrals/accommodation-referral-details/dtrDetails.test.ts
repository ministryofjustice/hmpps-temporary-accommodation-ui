import { createMock } from '@golevelup/ts-jest'
import { applicationFactory, localAuthorityFactory } from '../../../../testutils/factories'
import { dateAndTimeInputsAreValidDates, dateIsBlank, dateIsInFuture } from '../../../../utils/dateUtils'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import { CallConfig } from '../../../../data/restClient'
import { ReferenceDataService } from '../../../../services'
import DtrDetails from './dtrDetails'

jest.mock('../../../../utils/dateUtils', () => {
  const module = jest.requireActual('../../../../utils/dateUtils')

  return {
    ...module,
    dateIsBlank: jest.fn(),
    dateAndTimeInputsAreValidDates: jest.fn(),
    dateIsInFuture: jest.fn(),
  }
})

const localAuthorities = localAuthorityFactory.buildList(3)
const body = {
  reference: 'ABC123',
  'date-year': '2022',
  'date-month': '7',
  'date-day': '23',
  localAuthorityAreaName: localAuthorities[0].name,
}

describe('DtrDetails', () => {
  const application = applicationFactory.build()

  describe('body', () => {
    it('sets the body', () => {
      const page = new DtrDetails(body, application, localAuthorities)

      expect(page.body).toEqual({
        ...body,
        date: '2022-07-23',
      })
    })
  })

  itShouldHavePreviousValue(new DtrDetails({}, application, localAuthorities), 'dtr-submitted')
  itShouldHaveNextValue(new DtrDetails({}, application, localAuthorities), 'crs-submitted')

  describe('errors', () => {
    it('returns an empty object if the DTR details are populated', () => {
      ;(dateIsBlank as jest.Mock).mockReturnValue(false)
      ;(dateAndTimeInputsAreValidDates as jest.Mock).mockReturnValue(true)
      ;(dateIsInFuture as jest.Mock).mockReturnValue(false)

      const page = new DtrDetails(body, application, localAuthorities)
      expect(page.errors()).toEqual({})
    })

    it('returns an error if the reference is not populated', () => {
      ;(dateIsBlank as jest.Mock).mockReturnValue(false)
      ;(dateAndTimeInputsAreValidDates as jest.Mock).mockReturnValue(true)
      ;(dateIsInFuture as jest.Mock).mockReturnValue(false)

      const page = new DtrDetails({ ...body, reference: undefined }, application, localAuthorities)
      expect(page.errors()).toEqual({
        reference: 'You must specify the DTR / NOP reference number',
      })
    })

    it('returns an error if the date is not populated', () => {
      ;(dateIsBlank as jest.Mock).mockReturnValue(true)
      ;(dateAndTimeInputsAreValidDates as jest.Mock).mockReturnValue(true)
      ;(dateIsInFuture as jest.Mock).mockReturnValue(false)

      const page = new DtrDetails(body, application, localAuthorities)
      expect(page.errors()).toEqual({
        date: 'You must specify the date DTR / NOP was submitted',
      })
    })

    it('returns an error if the date is invalid', () => {
      ;(dateIsBlank as jest.Mock).mockReturnValue(false)
      ;(dateAndTimeInputsAreValidDates as jest.Mock).mockReturnValue(false)
      ;(dateIsInFuture as jest.Mock).mockReturnValue(false)

      const page = new DtrDetails(body, application, localAuthorities)
      expect(page.errors()).toEqual({
        date: 'You must specify a valid date DTR / NOP was submitted',
      })
    })

    it('returns an error if the date is in the future', () => {
      ;(dateIsBlank as jest.Mock).mockReturnValue(false)
      ;(dateAndTimeInputsAreValidDates as jest.Mock).mockReturnValue(true)
      ;(dateIsInFuture as jest.Mock).mockReturnValue(true)

      const page = new DtrDetails(body, application, localAuthorities)
      expect(page.errors()).toEqual({
        date: 'The date DTR / NOP was submitted must not be in the future',
      })
    })
  })

  describe('response', () => {
    describe('when local authority is selected', () => {
      it('returns a translated version of the response', () => {
        const page = new DtrDetails(body, application, localAuthorities)
        expect(page.response()).toEqual({
          'DTR / NOP reference number': 'ABC123',
          'Date DTR / NOP was submitted': '23 July 2022',
          'What is the local authority (optional)?': localAuthorities[0].name,
        })
      })
    })

    describe('when local authority is not selected', () => {
      it('returns placeholder copy for local authority', () => {
        const page = new DtrDetails({ ...body, localAuthorityAreaName: null }, application, localAuthorities)
        expect(page.response()).toEqual({
          'DTR / NOP reference number': 'ABC123',
          'Date DTR / NOP was submitted': '23 July 2022',
          'What is the local authority (optional)?': 'No local authority selected',
        })
      })
    })
  })

  describe('initialize', () => {
    describe('when fetch for local authorities is successful', () => {
      it('populates the body with a list of local authorities', async () => {
        const callConfig = { token: 'some-token' } as CallConfig
        const getLocalAuthoritiesMock = jest.fn().mockResolvedValue(localAuthorities)
        const referenceDataService = createMock<ReferenceDataService>({
          getLocalAuthorities: getLocalAuthoritiesMock,
        })

        await DtrDetails.initialize({}, application, callConfig, { referenceDataService })

        expect(getLocalAuthoritiesMock).toHaveBeenCalledWith(callConfig)
      })
    })

    describe('when fetch for local authorities is unsuccessful', () => {
      it('returns an empty list of local authorities', async () => {
        const callConfig = { token: 'some-token' } as CallConfig
        const getLocalAuthoritiesMock = jest.fn().mockImplementation(() => {
          throw new Error()
        })
        const referenceDataService = createMock<ReferenceDataService>({
          getLocalAuthorities: getLocalAuthoritiesMock,
        })

        const page = await DtrDetails.initialize({}, application, callConfig, { referenceDataService })

        expect(page.getLocalAuthorities()).toEqual([])
      })
    })
  })

  describe('getLocalAuthorities', () => {
    it('returns a list of local authorities', async () => {
      const callConfig = { token: 'some-token' } as CallConfig
      const getLocalAuthoritiesMock = jest.fn().mockResolvedValue(localAuthorities)
      const referenceDataService = createMock<ReferenceDataService>({
        getLocalAuthorities: getLocalAuthoritiesMock,
      })

      const page = await DtrDetails.initialize({}, application, callConfig, { referenceDataService })

      expect(page.getLocalAuthorities()).toEqual(localAuthorities)
    })
  })
})
