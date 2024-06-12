import { createMock } from '@golevelup/ts-jest'
import { applicationFactory, localAuthorityFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import { CallConfig } from '../../../../data/restClient'
import { ReferenceDataService } from '../../../../services'
import DtrDetails, { DtrDetailsBody } from './dtrDetails'

const localAuthorities = localAuthorityFactory.buildList(3)
const body = {
  reference: 'ABC123',
  'date-year': '2022',
  'date-month': '7',
  'date-day': '23',
  localAuthorityAreaName: localAuthorities[0].name,
  dutyToReferOutcome: 'acceptedPriorityNeed',
} as DtrDetailsBody

describe('DtrDetails', () => {
  const application = applicationFactory.build()

  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.clearAllTimers()
  })

  describe('body', () => {
    it('sets the body', () => {
      const page = new DtrDetails(body, application, localAuthorities)

      expect(page.body).toEqual({
        ...body,
        date: '2022-07-23',
      })
    })
  })

  describe('items', () => {
    it('marks an option as selected when the reason is set', () => {
      const page = new DtrDetails(body, application, localAuthorities)

      const selectedOptions = page.items().filter(item => item.checked)

      expect(selectedOptions.length).toEqual(1)
      expect(selectedOptions[0].value).toEqual('acceptedPriorityNeed')
    })

    it('marks no options selected when the reason is not set', () => {
      const page = new DtrDetails({}, application, localAuthorities)

      const selectedOptions = page.items().filter(item => item.checked)

      expect(selectedOptions.length).toEqual(0)
    })
  })

  itShouldHavePreviousValue(new DtrDetails({}, application, localAuthorities), 'dtr-submitted')
  itShouldHaveNextValue(new DtrDetails({}, application, localAuthorities), 'crs-submitted')

  describe('errors', () => {
    it('returns an empty object if the DTR details are populated', () => {
      const page = new DtrDetails(body, application, localAuthorities)

      expect(page.errors()).toEqual({})
    })

    it('returns an error if the reference is not populated', () => {
      const page = new DtrDetails({ ...body, reference: undefined }, application, localAuthorities)

      expect(page.errors()).toEqual({
        reference: 'You must specify the reference number',
      })
    })

    it('returns an error if the date is not populated', () => {
      const page = new DtrDetails(
        {
          ...body,
          'date-year': '',
          'date-month': '',
          'date-day': '',
        },
        application,
        localAuthorities,
      )

      expect(page.errors()).toEqual({
        date: 'Enter a submission date',
      })
    })

    it('returns an error if the date is invalid', () => {
      const page = new DtrDetails(
        {
          ...body,
          'date-year': '2022',
          'date-month': '13',
          'date-day': '33',
        },
        application,
        localAuthorities,
      )

      expect(page.errors()).toEqual({
        date: 'You must specify a valid submission date',
      })
    })

    it('returns an error if the date is in the future', () => {
      jest.setSystemTime(new Date('2022-01-01'))

      const page = new DtrDetails(body, application, localAuthorities)

      expect(page.errors()).toEqual({
        date: 'The submission date must not be in the future',
      })
    })

    it('returns an error if the Local Authority Area name is not selected', () => {
      const page = new DtrDetails({ ...body, localAuthorityAreaName: undefined }, application, localAuthorities)

      expect(page.errors()).toEqual({
        localAuthorityAreaName: 'Select a home local authority',
      })
    })

    it('returns an error if a duty to refer outcome is not selected', () => {
      const page = new DtrDetails({ ...body, dutyToReferOutcome: undefined }, application, localAuthorities)
      expect(page.errors()).toEqual({
        dutyToReferOutcome: 'Select whether you have received an outcome from the local authority',
      })
    })

    it('returns an error if duty to refer outcome rejectedOther is selected and other details is not populated', () => {
      const page = new DtrDetails({ ...body, dutyToReferOutcome: 'rejectedOther' }, application, localAuthorities)
      expect(page.errors()).toEqual({
        dutyToReferOutcomeOtherDetails: 'You must add details about the reason',
      })
    })
  })

  describe('response', () => {
    it('returns a translated version of the response', () => {
      const page = new DtrDetails(body, application, localAuthorities)
      expect(page.response()).toEqual({
        'Reference number': 'ABC123',
        'Submission date': '23 July 2022',
        'What is the local authority?': localAuthorities[0].name,
        'Have you received an outcome from the local authority?': 'Yes, it was accepted on a priority need',
      })
    })

    describe('when duty to refer rejectedOther outcome is selected and other details is populated', () => {
      it('returns a translated version of the response', () => {
        const page = new DtrDetails(
          { ...body, dutyToReferOutcome: 'rejectedOther', dutyToReferOutcomeOtherDetails: 'rejected reason' },
          application,
          localAuthorities,
        )
        expect(page.response()).toEqual({
          'Reference number': 'ABC123',
          'Submission date': '23 July 2022',
          'What is the local authority?': localAuthorities[0].name,
          'Have you received an outcome from the local authority?': 'Yes, it was rejected for another reason',
          'Other outcome details': 'rejected reason',
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

        await DtrDetails.initialize({} as DtrDetailsBody, application, callConfig, { referenceDataService })

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

        const page = await DtrDetails.initialize({} as DtrDetailsBody, application, callConfig, {
          referenceDataService,
        })

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

      const page = await DtrDetails.initialize({} as DtrDetailsBody, application, callConfig, { referenceDataService })

      expect(page.getLocalAuthorities()).toEqual(localAuthorities)
    })
  })
})
