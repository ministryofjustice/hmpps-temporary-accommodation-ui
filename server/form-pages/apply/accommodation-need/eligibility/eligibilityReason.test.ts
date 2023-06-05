import { applicationFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import EligibilityReason from './eligibilityReason'

const body = { reason: 'homelessFromApprovedPremises' as const }

describe('EligibilityReason', () => {
  const application = applicationFactory.build()

  describe('body', () => {
    it('sets the body', () => {
      const page = new EligibilityReason(body, application)

      expect(page.body).toEqual(body)
    })
  })

  itShouldHavePreviousValue(new EligibilityReason({}, application), 'dashboard')
  itShouldHaveNextValue(new EligibilityReason({}, application), 'release-date')

  describe('errors', () => {
    it('returns an empty object if the reason is populated', () => {
      const page = new EligibilityReason(body, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an errors if the reason is not populated', () => {
      const page = new EligibilityReason({}, application)
      expect(page.errors()).toEqual({ reason: 'You must choose a reason' })
    })
  })

  describe('items', () => {
    it('marks an option as selected when the reason is set', () => {
      const page = new EligibilityReason(body, application)

      const selectedOptions = page.items().filter(item => item.checked)

      expect(selectedOptions.length).toEqual(1)
      expect(selectedOptions[0].value).toEqual('homelessFromApprovedPremises')
    })

    it('marks no options selected when the reason is not set', () => {
      const page = new EligibilityReason({}, application)

      const selectedOptions = page.items().filter(item => item.checked)

      expect(selectedOptions.length).toEqual(0)
    })
  })

  describe('response', () => {
    it('returns a translated version of the response', () => {
      const page = new EligibilityReason(body, application)

      expect(page.response()).toEqual({ [page.title]: 'Moving on as homeless from an Approved Premises' })
    })
  })
})
