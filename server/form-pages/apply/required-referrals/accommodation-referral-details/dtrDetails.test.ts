import { applicationFactory } from '../../../../testutils/factories'
import { dateAndTimeInputsAreValidDates, dateIsBlank, dateIsInFuture } from '../../../../utils/dateUtils'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
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

const body = { reference: 'ABC123', 'date-year': '2022', 'date-month': '7', 'date-day': '23' }

describe('DtrDetails', () => {
  const application = applicationFactory.build()

  describe('body', () => {
    it('sets the body', () => {
      const page = new DtrDetails(body, application)

      expect(page.body).toEqual({
        ...body,
        date: '2022-07-23',
      })
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
        date: 'You must specify the date DTR / NOP was submitted',
      })
    })

    it('returns an error if the date is invalid', () => {
      ;(dateIsBlank as jest.Mock).mockReturnValue(false)
      ;(dateAndTimeInputsAreValidDates as jest.Mock).mockReturnValue(false)
      ;(dateIsInFuture as jest.Mock).mockReturnValue(false)

      const page = new DtrDetails(body, application)
      expect(page.errors()).toEqual({
        date: 'You must specify a valid date DTR / NOP was submitted',
      })
    })

    it('returns an error if the date is in the future', () => {
      ;(dateIsBlank as jest.Mock).mockReturnValue(false)
      ;(dateAndTimeInputsAreValidDates as jest.Mock).mockReturnValue(true)
      ;(dateIsInFuture as jest.Mock).mockReturnValue(true)

      const page = new DtrDetails(body, application)
      expect(page.errors()).toEqual({
        date: 'The date DTR / NOP was submitted must not be in the future',
      })
    })
  })

  describe('response', () => {
    it('returns a translated version of the response', () => {
      const page = new DtrDetails(body, application)
      expect(page.response()).toEqual({
        'DTR / NOP reference number': 'ABC123',
        'Date DTR / NOP was submitted': '23 July 2022',
      })
    })
  })
})
