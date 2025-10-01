import { applicationFactory } from '../../../../testutils/factories'
import AlternativePduReason, { AlternativePduReasonBody } from './alternativePduReason'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

describe('alternativePduReason', () => {
  const application = applicationFactory.build()
  const body: AlternativePduReasonBody = { reason: 'Some reason for requesting placement in an alternative PDU' }

  describe('body', () => {
    it('sets the body', () => {
      const page = new AlternativePduReason(body, application)

      expect(page.body).toEqual(body)
    })
  })

  itShouldHavePreviousValue(new AlternativePduReason(body, application), 'alternative-pdu')
  itShouldHaveNextValue(new AlternativePduReason(body, application), '')

  describe('response', () => {
    it('returns a translated version of the response', () => {
      const page = new AlternativePduReason(body, application)

      expect(page.response()).toEqual({
        'Reason for choosing an alternative PDU': body.reason,
      })
    })
  })

  describe('errors', () => {
    it('returns no errors if the answer has been provided', () => {
      const page = new AlternativePduReason(body, application)

      expect(page.errors()).toEqual({})
    })

    it('returns an error if the answer has not been provided', () => {
      const page = new AlternativePduReason({}, application)

      expect(page.errors()).toEqual({
        reason: 'You must provide a reason for choosing a different PDU',
      })
    })
  })
})
