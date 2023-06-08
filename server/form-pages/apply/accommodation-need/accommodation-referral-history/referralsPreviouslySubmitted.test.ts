import { applicationFactory, personFactory } from '../../../../testutils/factories'
import { itShouldHavePreviousValue } from '../../../shared-examples'
import { yesNoOrDontKnowResponse } from '../../../utils'
import ReferralsPreviouslySubmitted from './referralsPreviouslySubmitted'

jest.mock('../../../utils')

const body = { referralsPreviouslySubmitted: 'yes' as const }

describe('ReferralsPreviouslySubmitted', () => {
  const application = applicationFactory.build({
    person: personFactory.build({
      name: 'John Smith',
    }),
  })

  describe('body', () => {
    it('sets the body', () => {
      const page = new ReferralsPreviouslySubmitted(body, application)

      expect(page.body).toEqual(body)
    })
  })

  itShouldHavePreviousValue(new ReferralsPreviouslySubmitted({}, application), 'dashboard')

  describe('next', () => {
    it('returns the referral history details page ID when a referral has previously been submitted', () => {
      expect(
        new ReferralsPreviouslySubmitted({ ...body, referralsPreviouslySubmitted: 'yes' }, application).next(),
      ).toEqual('referral-history-details')
    })

    it('returns an empty page ID when no referral has previously been submitted', () => {
      expect(
        new ReferralsPreviouslySubmitted({ ...body, referralsPreviouslySubmitted: 'no' }, application).next(),
      ).toEqual('')
    })

    it('returns an empty page ID when it is unknown whether a referral has previously been submitted', () => {
      expect(
        new ReferralsPreviouslySubmitted({ ...body, referralsPreviouslySubmitted: 'iDontKnow' }, application).next(),
      ).toEqual('')
    })
  })

  describe('errors', () => {
    it('returns an empty object if referralsPreviouslySubmitted is populated', () => {
      const page = new ReferralsPreviouslySubmitted(body, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an error if the referralsPreviouslySubmitted is not populated', () => {
      const page = new ReferralsPreviouslySubmitted({}, application)
      expect(page.errors()).toEqual({
        referralsPreviouslySubmitted:
          'You must specify whether referrals for accommodation services have been submitted previously',
      })
    })
  })

  describe('response', () => {
    it('returns a translated version of the response', () => {
      ;(yesNoOrDontKnowResponse as jest.Mock).mockReturnValue("Yes, no, or don't know response")

      const page = new ReferralsPreviouslySubmitted(body, application)

      expect(page.response()).toEqual({
        'Have referrals for accommodation services been submitted for John Smith previously?':
          "Yes, no, or don't know response",
      })
      expect(yesNoOrDontKnowResponse).toHaveBeenCalledWith('referralsPreviouslySubmitted', body)
    })
  })
})
