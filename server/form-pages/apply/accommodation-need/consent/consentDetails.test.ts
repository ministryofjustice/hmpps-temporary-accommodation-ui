import { applicationFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import ConsentDetails from './consentDetails'

const body = { consentType: 'other' as const, consentTypeDetail: 'Consent details' }

describe('ConsentDetails', () => {
  const application = applicationFactory.build()

  describe('body', () => {
    it('sets the body', () => {
      const page = new ConsentDetails(body, application)

      expect(page.body).toEqual(body)
    })
  })

  itShouldHavePreviousValue(new ConsentDetails({}, application), 'consent-given')
  itShouldHaveNextValue(new ConsentDetails({}, application), '')

  describe('errors', () => {
    it('returns an empty object if the consent type fields are populated', () => {
      const page = new ConsentDetails(body, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an empty object if the consent type is not other and the detail field is not populated', () => {
      const page = new ConsentDetails({ consentType: 'verbal' }, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an error if the consent type is not populated', () => {
      const page = new ConsentDetails({ ...body, consentType: undefined }, application)
      expect(page.errors()).toEqual({
        consentType: 'You must specify how consent was given',
      })
    })

    it('returns an error if the consent type is other but the detail field is not populated', () => {
      const page = new ConsentDetails({ ...body, consentTypeDetail: undefined }, application)
      expect(page.errors()).toEqual({
        consentTypeDetail: 'You must specify how consent was given',
      })
    })
  })

  describe('response', () => {
    it('returns a translated version of the response if the consent type is other', () => {
      const page = new ConsentDetails(body, application)
      expect(page.response()).toEqual({
        'How was consent given?': 'Other - Consent details',
      })
    })

    it('returns a translated version of the response if the consent type is not other', () => {
      const page = new ConsentDetails({ consentType: 'verbal' }, application)
      expect(page.response()).toEqual({
        'How was consent given?': 'Verbal',
      })
    })
  })
})
