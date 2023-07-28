import { applicationFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import SupportInTheCommunity from './supportInTheComunity'

const body = { support: 'Support details' }

describe('SupportInTheCommunity', () => {
  const application = applicationFactory.build()

  describe('body', () => {
    it('sets the body', () => {
      const page = new SupportInTheCommunity(body, application)

      expect(page.body).toEqual(body)
    })
  })

  itShouldHavePreviousValue(new SupportInTheCommunity({}, application), 'safeguarding-and-vulnerability')
  itShouldHaveNextValue(new SupportInTheCommunity({}, application), 'local-connections')

  describe('errors', () => {
    it('returns an empty object if the support field is populated', () => {
      const page = new SupportInTheCommunity(body, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an error if the support field is not populated', () => {
      const page = new SupportInTheCommunity({ ...body, support: undefined }, application)
      expect(page.errors()).toEqual({
        support: 'You must provide details of what support is or will be in place',
      })
    })
  })

  describe('response', () => {
    it('returns a translated version of the response', () => {
      const page = new SupportInTheCommunity(body, application)
      expect(page.response()).toEqual({
        'Details of support in the community': body.support,
      })
    })
  })
})
