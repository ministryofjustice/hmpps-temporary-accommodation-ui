import { applicationFactory } from '../../../../testutils/factories'
import {
  dateAndTimeInputsAreValidDates,
  dateIsBlank,
  dateIsInThePast,
  dateIsWithinNextThreeMonths,
} from '../../../../utils/dateUtils'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import ReleaseDate from './releaseDate'

jest.mock('../../../../utils/dateUtils', () => {
  const module = jest.requireActual('../../../../utils/dateUtils')

  return {
    ...module,
    dateIsBlank: jest.fn(),
    dateAndTimeInputsAreValidDates: jest.fn(),
    dateIsInThePast: jest.fn(),
    dateIsWithinNextThreeMonths: jest.fn(),
  }
})

const body = { 'releaseDate-year': '2024', 'releaseDate-month': '4', 'releaseDate-day': '11' }

describe('ReleaseDate', () => {
  const application = applicationFactory.build()

  describe('body', () => {
    it('sets the body', () => {
      const page = new ReleaseDate(body, application)

      expect(page.body).toEqual({
        ...body,
        releaseDate: '2024-04-11',
      })
    })
  })

  itShouldHavePreviousValue(new ReleaseDate({}, application), 'eligibility-reason')
  itShouldHaveNextValue(new ReleaseDate({}, application), 'accommodation-required-from-date')

  describe('errors', () => {
    it('should return an empty object if the release date is specified', () => {
      ;(dateIsBlank as jest.Mock).mockReturnValue(false)
      ;(dateAndTimeInputsAreValidDates as jest.Mock).mockReturnValue(true)
      ;(dateIsInThePast as jest.Mock).mockReturnValue(false)
      ;(dateIsWithinNextThreeMonths as jest.Mock).mockReturnValue(true)

      const page = new ReleaseDate(body, application)
      expect(page.errors()).toEqual({})
    })

    it('should return an error if the date is not populated', () => {
      ;(dateIsBlank as jest.Mock).mockReturnValue(true)
      ;(dateAndTimeInputsAreValidDates as jest.Mock).mockReturnValue(true)
      ;(dateIsInThePast as jest.Mock).mockReturnValue(false)
      ;(dateIsWithinNextThreeMonths as jest.Mock).mockReturnValue(true)

      const page = new ReleaseDate(body, application)
      expect(page.errors()).toEqual({ releaseDate: 'You must specify the release date' })
    })

    it('should return an error if the date is invalid', () => {
      ;(dateIsBlank as jest.Mock).mockReturnValue(false)
      ;(dateAndTimeInputsAreValidDates as jest.Mock).mockReturnValue(false)
      ;(dateIsInThePast as jest.Mock).mockReturnValue(false)
      ;(dateIsWithinNextThreeMonths as jest.Mock).mockReturnValue(true)

      const page = new ReleaseDate(body, application)
      expect(page.errors()).toEqual({ releaseDate: 'You must specify a valid release date' })
    })

    it('should return an error if the date is in the past', () => {
      ;(dateIsBlank as jest.Mock).mockReturnValue(false)
      ;(dateAndTimeInputsAreValidDates as jest.Mock).mockReturnValue(true)
      ;(dateIsInThePast as jest.Mock).mockReturnValue(true)
      ;(dateIsWithinNextThreeMonths as jest.Mock).mockReturnValue(true)

      const page = new ReleaseDate(body, application)
      expect(page.errors()).toEqual({ releaseDate: 'Release date cannot be in the past' })
    })

    it('should return an error if the date is not within the next 3 months', () => {
      ;(dateIsBlank as jest.Mock).mockReturnValue(false)
      ;(dateAndTimeInputsAreValidDates as jest.Mock).mockReturnValue(true)
      ;(dateIsInThePast as jest.Mock).mockReturnValue(false)
      ;(dateIsWithinNextThreeMonths as jest.Mock).mockReturnValue(false)

      const page = new ReleaseDate(body, application)
      expect(page.errors()).toEqual({
        releaseDate: 'Release date must be within 3 months',
      })
    })
  })

  describe('response', () => {
    it('returns a translated version of the response', () => {
      const page = new ReleaseDate(body, application)
      expect(page.response()).toEqual({ 'Release date': '11 April 2024' })
    })
  })
})
