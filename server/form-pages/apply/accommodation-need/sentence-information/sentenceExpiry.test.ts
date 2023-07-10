import { applicationFactory } from '../../../../testutils/factories'
import { dateAndTimeInputsAreValidDates, dateIsBlank } from '../../../../utils/dateUtils'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import SentenceExpiry from './sentenceExpiry'

jest.mock('../../../../utils/dateUtils', () => {
  const module = jest.requireActual('../../../../utils/dateUtils')

  return {
    ...module,
    dateIsBlank: jest.fn(),
    dateAndTimeInputsAreValidDates: jest.fn(),
  }
})

const body = { 'sentenceExpiryDate-year': '2024', 'sentenceExpiryDate-month': '4', 'sentenceExpiryDate-day': '11' }

describe('SentenceExpiry', () => {
  const application = applicationFactory.build()

  describe('body', () => {
    it('sets the body', () => {
      const page = new SentenceExpiry(body, application)

      expect(page.body).toEqual({
        ...body,
        sentenceExpiryDate: '2024-04-11',
      })
    })
  })

  itShouldHavePreviousValue(new SentenceExpiry({}, application), 'sentence-length')
  itShouldHaveNextValue(new SentenceExpiry({}, application), 'release-type')

  describe('errors', () => {
    it('should return an empty object if the release date is specified', () => {
      ;(dateIsBlank as jest.Mock).mockReturnValue(false)
      ;(dateAndTimeInputsAreValidDates as jest.Mock).mockReturnValue(true)

      const page = new SentenceExpiry(body, application)
      expect(page.errors()).toEqual({})
    })

    it('should return an error if the date is not populated', () => {
      ;(dateIsBlank as jest.Mock).mockReturnValue(true)
      ;(dateAndTimeInputsAreValidDates as jest.Mock).mockReturnValue(true)

      const page = new SentenceExpiry(body, application)
      expect(page.errors()).toEqual({ sentenceExpiryDate: 'You must specify the sentence expiry date' })
    })

    it('should return an error if the date is invalid', () => {
      ;(dateIsBlank as jest.Mock).mockReturnValue(false)
      ;(dateAndTimeInputsAreValidDates as jest.Mock).mockReturnValue(false)

      const page = new SentenceExpiry(body, application)
      expect(page.errors()).toEqual({ sentenceExpiryDate: 'You must specify a valid sentence expiry date' })
    })
  })

  describe('response', () => {
    it('returns a translated version of the response', () => {
      const page = new SentenceExpiry(body, application)
      expect(page.response()).toEqual({ 'Sentence expiry date': '11 April 2024' })
    })
  })
})
