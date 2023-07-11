import { applicationFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import ConsentGiven from './consentGiven'

const body = { consentGiven: 'yes' as const }

describe('ConsentGiven', () => {
  const application = applicationFactory.build()

  describe('body', () => {
    it('sets the body', () => {
      const page = new ConsentGiven(body, application)

      expect(page.body).toEqual(body)
    })
  })

  itShouldHavePreviousValue(new ConsentGiven({}, application), 'dashboard')
  itShouldHaveNextValue(new ConsentGiven({}, application), '')

  describe('errors', () => {
    it('returns an empty object if all fields are populated', () => {
      const page = new ConsentGiven(body, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an error if the consent given field is not populated', () => {
      const page = new ConsentGiven({ ...body, consentGiven: undefined }, application)
      expect(page.errors()).toEqual({
        consentGiven: 'You must specify if consent for Temporary Accommodation has been given',
      })
    })
  })

  describe('response', () => {
    it('returns a translated version of the response', () => {
      const page = new ConsentGiven(body, application)
      expect(page.response()).toEqual({
        'Has consent for Temporary Accommodation been given?': 'Yes',
      })
    })
  })
})
