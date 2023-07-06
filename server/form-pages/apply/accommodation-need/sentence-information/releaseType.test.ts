import { applicationFactory } from '../../../../testutils/factories'
import { dateAndTimeInputsAreValidDates, dateIsBlank } from '../../../../utils/dateUtils'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import ReleaseType from './releaseType'

jest.mock('../../../../utils/dateUtils', () => {
  const module = jest.requireActual('../../../../utils/dateUtils')

  return {
    ...module,
    dateIsBlank: jest.fn(),
    dateAndTimeInputsAreValidDates: jest.fn(),
  }
})

const body = {
  releaseTypes: ['licence' as const, 'pss' as const],
  'licenceStartDate-year': '2024',
  'licenceStartDate-month': '1',
  'licenceStartDate-day': '19',
  'licenceEndDate-year': '2024',
  'licenceEndDate-month': '7',
  'licenceEndDate-day': '9',
  'pssStartDate-year': '2122',
  'pssStartDate-month': '4',
  'pssStartDate-day': '1',
  'pssEndDate-year': '2122',
  'pssEndDate-month': '7',
  'pssEndDate-day': '18',
}

describe('SentenceExpiry', () => {
  const application = applicationFactory.build()

  describe('body', () => {
    it('sets the body', () => {
      const page = new ReleaseType(body, application)

      expect(page.body).toEqual({
        ...body,
        licenceStartDate: '2024-01-19',
        licenceEndDate: '2024-07-09',
        pssStartDate: '2122-04-01',
        pssEndDate: '2122-07-18',
      })
    })
  })

  itShouldHavePreviousValue(new ReleaseType({}, application), 'sentence-expiry')
  itShouldHaveNextValue(new ReleaseType({}, application), '')

  describe('errors', () => {
    it('returns an empty object if the all fields are populated', () => {
      ;(dateIsBlank as jest.Mock).mockReturnValue(false)
      ;(dateAndTimeInputsAreValidDates as jest.Mock).mockReturnValue(true)

      const page = new ReleaseType(body, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an empty object if the licence release type is specified and only the licence dates are specified', () => {
      ;(dateIsBlank as jest.MockedFunction<typeof dateIsBlank>).mockImplementation(
        (_, field) => !(field as string).startsWith('licence'),
      )
      ;(dateAndTimeInputsAreValidDates as jest.Mock).mockReturnValue(true)

      const page = new ReleaseType({ ...body, releaseTypes: ['licence'] }, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an empty object if the PSS release type is specified and only the PSS dates are specified', () => {
      ;(dateIsBlank as jest.MockedFunction<typeof dateIsBlank>).mockImplementation(
        (_, field) => !(field as string).startsWith('pss'),
      )
      ;(dateAndTimeInputsAreValidDates as jest.Mock).mockReturnValue(true)

      const page = new ReleaseType({ ...body, releaseTypes: ['pss'] }, application)
      expect(page.errors()).toEqual({})
    })

    it('returns errors if the licence release type is specified and the licence dates are blank', () => {
      ;(dateIsBlank as jest.MockedFunction<typeof dateIsBlank>).mockImplementation((_, field) =>
        (field as string).startsWith('licence'),
      )
      ;(dateAndTimeInputsAreValidDates as jest.Mock).mockReturnValue(true)

      const page = new ReleaseType(body, application)
      expect(page.errors()).toEqual({
        licenceStartDate: 'You must specify the licence start date',
        licenceEndDate: 'You must specify the licence end date',
      })
    })

    it('returns errors if the licence release type is specified and the licence dates are invalid', () => {
      ;(dateIsBlank as jest.Mock).mockReturnValue(false)
      ;(
        dateAndTimeInputsAreValidDates as jest.MockedFunction<typeof dateAndTimeInputsAreValidDates>
      ).mockImplementation((_, field) => !(field as string).startsWith('licence'))

      const page = new ReleaseType(body, application)
      expect(page.errors()).toEqual({
        licenceStartDate: 'You must specify a valid licence start date',
        licenceEndDate: 'You must specify a valid licence end date',
      })
    })

    it('returns errors if the PSS release type is specified and the PSS dates are blank', () => {
      ;(dateIsBlank as jest.MockedFunction<typeof dateIsBlank>).mockImplementation((_, field) =>
        (field as string).startsWith('pss'),
      )
      ;(dateAndTimeInputsAreValidDates as jest.Mock).mockReturnValue(true)

      const page = new ReleaseType(body, application)
      expect(page.errors()).toEqual({
        pssStartDate: 'You must specify the PSS start date',
        pssEndDate: 'You must specify the PSS end date',
      })
    })

    it('returns errors if the PSS release type is specified and the PSS dates are invalid', () => {
      ;(dateIsBlank as jest.Mock).mockReturnValue(false)
      ;(
        dateAndTimeInputsAreValidDates as jest.MockedFunction<typeof dateAndTimeInputsAreValidDates>
      ).mockImplementation((_, field) => !(field as string).startsWith('pss'))

      const page = new ReleaseType(body, application)
      expect(page.errors()).toEqual({
        pssStartDate: 'You must specify a valid PSS start date',
        pssEndDate: 'You must specify a valid PSS end date',
      })
    })
  })

  describe('response', () => {
    it('returns a translated version of the response when both release types are selected', () => {
      const page = new ReleaseType(body, application)
      expect(page.response()).toEqual({
        'What is the release type?': 'Licence\nPost sentence supervision (PSS)',
        'Licence start date': '19 January 2024',
        'Licence end date': '9 July 2024',
        'PSS start date': '1 April 2122',
        'PSS end date': '18 July 2122',
      })
    })

    it('returns a translated version of the response when the licence release type is selected', () => {
      const page = new ReleaseType({ ...body, releaseTypes: ['licence'] }, application)
      expect(page.response()).toEqual({
        'What is the release type?': 'Licence',
        'Licence start date': '19 January 2024',
        'Licence end date': '9 July 2024',
      })
    })

    it('returns a translated version of the response when the PSS release type is selected', () => {
      const page = new ReleaseType({ ...body, releaseTypes: ['pss'] }, application)
      expect(page.response()).toEqual({
        'What is the release type?': 'Post sentence supervision (PSS)',
        'PSS start date': '1 April 2122',
        'PSS end date': '18 July 2122',
      })
    })
  })
})
