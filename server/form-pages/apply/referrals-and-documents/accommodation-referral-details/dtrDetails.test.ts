import { applicationFactory } from '../../../../testutils/factories'
import { DateFormats, dateAndTimeInputsAreValidDates, dateIsBlank, dateIsInFuture } from '../../../../utils/dateUtils'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import DtrDetails from './dtrDetails'

jest.mock('../../../../utils/dateUtils')

const body = { reference: 'ABC123', date: '2022-07-23' }

describe('DtrDetails', () => {
  const application = applicationFactory.build()

  describe('body', () => {
    it('sets the body', () => {
      const page = new DtrDetails(body, application)

      expect(page.body).toEqual(body)
    })
  })

  itShouldHavePreviousValue(new DtrDetails({}, application), 'dtr-submitted')
  itShouldHaveNextValue(new DtrDetails({}, application), 'crs-submitted')

  describe('errors', () => {
    it('returns an empty object if the DTR details are populated', () => {
      ;(dateIsBlank as jest.Mock).mockReturnValue(false)
      ;(dateAndTimeInputsAreValidDates as jest.Mock).mockReturnValue(true)
      ;(dateIsInFuture as jest.Mock).mockReturnValue(false)

      const page = new DtrDetails(body, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an error if the reference is not populated', () => {
      ;(dateIsBlank as jest.Mock).mockReturnValue(false)
      ;(dateAndTimeInputsAreValidDates as jest.Mock).mockReturnValue(true)
      ;(dateIsInFuture as jest.Mock).mockReturnValue(false)

      const page = new DtrDetails({ ...body, reference: undefined }, application)
      expect(page.errors()).toEqual({
        reference: 'You must specify the DTR / NOP reference number',
      })
    })

    it('returns an error if the date is not populated', () => {
      ;(dateIsBlank as jest.Mock).mockReturnValue(true)
      ;(dateAndTimeInputsAreValidDates as jest.Mock).mockReturnValue(true)
      ;(dateIsInFuture as jest.Mock).mockReturnValue(false)

      const page = new DtrDetails(body, application)
      expect(page.errors()).toEqual({
        date: 'You must specify the date of DTR / NOP',
      })
    })

    it('returns an error if the date is invalid', () => {
      ;(dateIsBlank as jest.Mock).mockReturnValue(false)
      ;(dateAndTimeInputsAreValidDates as jest.Mock).mockReturnValue(false)
      ;(dateIsInFuture as jest.Mock).mockReturnValue(false)

      const page = new DtrDetails(body, application)
      expect(page.errors()).toEqual({
        date: 'You must specify a valid date of DTR / NOP',
      })
    })

    it('returns an error if the date is in the future', () => {
      ;(dateIsBlank as jest.Mock).mockReturnValue(false)
      ;(dateAndTimeInputsAreValidDates as jest.Mock).mockReturnValue(true)
      ;(dateIsInFuture as jest.Mock).mockReturnValue(true)

      const page = new DtrDetails(body, application)
      expect(page.errors()).toEqual({
        date: 'The date of DTR / NOP must not be in the future',
      })
    })
  })

  describe('response', () => {
    it('returns a translated version of the response', () => {
      ;(DateFormats.isoDateToUIDate as jest.Mock).mockReturnValue('23 July 2023')

      const page = new DtrDetails(body, application)
      expect(page.response()).toEqual({
        'DTR / NOP reference number': 'ABC123',
        'Date of DTR / NOP': '23 July 2023',
      })
    })
  })
})
