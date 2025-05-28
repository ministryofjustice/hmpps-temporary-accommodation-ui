import { applicationFactory } from '../../../../testutils/factories'
import {
  dateAndTimeInputsAreValidDates,
  dateIsBlank,
  dateIsInThePast,
  dateIsWithinNextThreeMonths,
} from '../../../../utils/dateUtils'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import AccommodationRequiredFromDate from './accommodationRequiredFromDate'

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

const body = {
  'accommodationRequiredFromDate-year': '2024',
  'accommodationRequiredFromDate-month': '4',
  'accommodationRequiredFromDate-day': '11',
}

describe('AccommodationRequiredFromDate', () => {
  const application = applicationFactory.build()

  describe('body', () => {
    it('sets the body', () => {
      const page = new AccommodationRequiredFromDate(body, application)

      expect(page.body).toEqual({
        ...body,
        accommodationRequiredFromDate: '2024-04-11',
      })
    })
  })

  itShouldHavePreviousValue(new AccommodationRequiredFromDate({}, application), 'release-date')
  itShouldHaveNextValue(new AccommodationRequiredFromDate({}, application), '')

  describe('errors', () => {
    it('should return an empty object if the release date is specified', () => {
      ;(dateIsBlank as jest.Mock).mockReturnValue(false)
      ;(dateAndTimeInputsAreValidDates as jest.Mock).mockReturnValue(true)
      ;(dateIsInThePast as jest.Mock).mockReturnValue(false)
      ;(dateIsWithinNextThreeMonths as jest.Mock).mockReturnValue(true)

      const page = new AccommodationRequiredFromDate(body, application)
      expect(page.errors()).toEqual({})
    })

    it('should return an error if the date is not populated', () => {
      ;(dateIsBlank as jest.Mock).mockReturnValue(true)
      ;(dateAndTimeInputsAreValidDates as jest.Mock).mockReturnValue(true)
      ;(dateIsInThePast as jest.Mock).mockReturnValue(false)
      ;(dateIsWithinNextThreeMonths as jest.Mock).mockReturnValue(true)

      const page = new AccommodationRequiredFromDate(body, application)
      expect(page.errors()).toEqual({
        accommodationRequiredFromDate: 'You must specify the date accommodation is required from',
      })
    })

    it('should return an error if the date is invalid', () => {
      ;(dateIsBlank as jest.Mock).mockReturnValue(false)
      ;(dateAndTimeInputsAreValidDates as jest.Mock).mockReturnValue(false)
      ;(dateIsInThePast as jest.Mock).mockReturnValue(false)
      ;(dateIsWithinNextThreeMonths as jest.Mock).mockReturnValue(true)

      const page = new AccommodationRequiredFromDate(body, application)
      expect(page.errors()).toEqual({
        accommodationRequiredFromDate: 'You must specify a valid date accommodation is required from',
      })
    })

    it('should return an error if the date is in the past', () => {
      ;(dateIsBlank as jest.Mock).mockReturnValue(false)
      ;(dateAndTimeInputsAreValidDates as jest.Mock).mockReturnValue(true)
      ;(dateIsInThePast as jest.Mock).mockReturnValue(true)
      ;(dateIsWithinNextThreeMonths as jest.Mock).mockReturnValue(true)

      const page = new AccommodationRequiredFromDate(body, application)
      expect(page.errors()).toEqual({
        accommodationRequiredFromDate: 'The date accommodation is required from must not be in the past',
      })
    })

    it('should return an error if the date is not within the next 3 months', () => {
      ;(dateIsBlank as jest.Mock).mockReturnValue(false)
      ;(dateAndTimeInputsAreValidDates as jest.Mock).mockReturnValue(true)
      ;(dateIsInThePast as jest.Mock).mockReturnValue(false)
      ;(dateIsWithinNextThreeMonths as jest.Mock).mockReturnValue(false)

      const page = new AccommodationRequiredFromDate(body, application)
      expect(page.errors()).toEqual({
        accommodationRequiredFromDate: 'Date accommodation is required from must be within 3 months',
      })
    })
  })

  describe('response', () => {
    it('returns a translated version of the response', () => {
      const page = new AccommodationRequiredFromDate(body, application)
      expect(page.response()).toEqual({ 'Accommodation required from date': '11 April 2024' })
    })
  })
})
