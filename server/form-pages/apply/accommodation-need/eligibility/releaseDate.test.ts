import { applicationFactory } from '../../../../testutils/factories'
import { DateFormats, dateAndTimeInputsAreValidDates, dateIsBlank, dateIsInThePast } from '../../../../utils/dateUtils'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import ReleaseDate from './releaseDate'

jest.mock('../../../../utils/dateUtils')

const body = { releaseDate: '2024-04-11' as const }

describe('ReleaseDate', () => {
  const application = applicationFactory.build()

  describe('body', () => {
    it('sets the body', () => {
      const page = new ReleaseDate(body, application)

      expect(page.body).toEqual(body)
    })
  })

  itShouldHavePreviousValue(new ReleaseDate({}, application), 'eligibility-reason')
  itShouldHaveNextValue(new ReleaseDate({}, application), 'accommodation-required-from-date')

  describe('errors', () => {
    it('should return an empty object if the release date is specified', () => {
      ;(dateIsBlank as jest.Mock).mockReturnValue(false)
      ;(dateAndTimeInputsAreValidDates as jest.Mock).mockReturnValue(true)
      ;(dateIsInThePast as jest.Mock).mockReturnValue(false)

      const page = new ReleaseDate(body, application)
      expect(page.errors()).toEqual({})
    })

    it('should return an error if the date is not populated', () => {
      ;(dateIsBlank as jest.Mock).mockReturnValue(true)
      ;(dateAndTimeInputsAreValidDates as jest.Mock).mockReturnValue(true)
      ;(dateIsInThePast as jest.Mock).mockReturnValue(false)

      const page = new ReleaseDate(body, application)
      expect(page.errors()).toEqual({ releaseDate: 'You must specify the release date' })
    })

    it('should return an error if the date is invalid', () => {
      ;(dateIsBlank as jest.Mock).mockReturnValue(false)
      ;(dateAndTimeInputsAreValidDates as jest.Mock).mockReturnValue(false)
      ;(dateIsInThePast as jest.Mock).mockReturnValue(false)

      const page = new ReleaseDate(body, application)
      expect(page.errors()).toEqual({ releaseDate: 'You must specify a valid release date' })
    })

    it('should return an error if the date is in the past', () => {
      ;(dateIsBlank as jest.Mock).mockReturnValue(false)
      ;(dateAndTimeInputsAreValidDates as jest.Mock).mockReturnValue(true)
      ;(dateIsInThePast as jest.Mock).mockReturnValue(true)

      const page = new ReleaseDate(body, application)
      expect(page.errors()).toEqual({ releaseDate: 'The release date must not be in the past' })
    })
  })

  describe('response', () => {
    it('returns a translated version of the response', () => {
      ;(DateFormats.isoDateToUIDate as jest.Mock).mockReturnValue('11 April 2024')

      const page = new ReleaseDate(body, application)
      expect(page.response()).toEqual({ 'Release date': '11 April 2024' })

      expect(DateFormats.isoDateToUIDate).toHaveBeenCalledWith('2024-04-11')
    })
  })
})
