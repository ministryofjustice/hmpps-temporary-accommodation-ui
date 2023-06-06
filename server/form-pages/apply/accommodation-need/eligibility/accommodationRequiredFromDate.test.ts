import { applicationFactory } from '../../../../testutils/factories'
import { DateFormats, dateAndTimeInputsAreValidDates, dateIsBlank, dateIsInThePast } from '../../../../utils/dateUtils'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import AccommodationRequiredFromDate from './accommodationRequiredFromDate'

jest.mock('../../../../utils/dateUtils')

const body = { accommodationRequiredFromDate: '2024-04-11' as const }

describe('AccommodationRequiredFromDate', () => {
  const application = applicationFactory.build()

  describe('body', () => {
    it('sets the body', () => {
      const page = new AccommodationRequiredFromDate(body, application)

      expect(page.body).toEqual(body)
    })
  })

  itShouldHavePreviousValue(new AccommodationRequiredFromDate({}, application), 'release-date')
  itShouldHaveNextValue(new AccommodationRequiredFromDate({}, application), '')

  describe('errors', () => {
    it('should return an empty object if the release date is specified', () => {
      ;(dateIsBlank as jest.Mock).mockReturnValue(false)
      ;(dateAndTimeInputsAreValidDates as jest.Mock).mockReturnValue(true)
      ;(dateIsInThePast as jest.Mock).mockReturnValue(false)

      const page = new AccommodationRequiredFromDate(body, application)
      expect(page.errors()).toEqual({})
    })

    it('should return an error if the date is not populated', () => {
      ;(dateIsBlank as jest.Mock).mockReturnValue(true)
      ;(dateAndTimeInputsAreValidDates as jest.Mock).mockReturnValue(true)
      ;(dateIsInThePast as jest.Mock).mockReturnValue(false)

      const page = new AccommodationRequiredFromDate(body, application)
      expect(page.errors()).toEqual({
        accommodationRequiredFromDate: 'You must specify the date accommodation is required from',
      })
    })

    it('should return an error if the date is invalid', () => {
      ;(dateIsBlank as jest.Mock).mockReturnValue(false)
      ;(dateAndTimeInputsAreValidDates as jest.Mock).mockReturnValue(false)
      ;(dateIsInThePast as jest.Mock).mockReturnValue(false)

      const page = new AccommodationRequiredFromDate(body, application)
      expect(page.errors()).toEqual({
        accommodationRequiredFromDate: 'You must specify a valid date accommodation is required from',
      })
    })

    it('should return an error if the date is in the past', () => {
      ;(dateIsBlank as jest.Mock).mockReturnValue(false)
      ;(dateAndTimeInputsAreValidDates as jest.Mock).mockReturnValue(true)
      ;(dateIsInThePast as jest.Mock).mockReturnValue(true)

      const page = new AccommodationRequiredFromDate(body, application)
      expect(page.errors()).toEqual({
        accommodationRequiredFromDate: 'The date accommodation is required from must not be in the past',
      })
    })
  })

  describe('response', () => {
    it('returns a translated version of the response', () => {
      ;(DateFormats.isoDateToUIDate as jest.Mock).mockReturnValue('11 April 2024')

      const page = new AccommodationRequiredFromDate(body, application)
      expect(page.response()).toEqual({ 'Accommodation required from date': '11 April 2024' })

      expect(DateFormats.isoDateToUIDate).toHaveBeenCalledWith('2024-04-11')
    })
  })
})
