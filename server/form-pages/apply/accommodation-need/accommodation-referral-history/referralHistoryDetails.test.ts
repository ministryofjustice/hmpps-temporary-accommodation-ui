import { applicationFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import ReferralHistoryDetails from './referralHistoryDetails'

const body = {
  accommodationTypes: ['dtr' as const, 'cas3' as const],
  dtrDetail: 'DTR detail',
  cas3Detail: 'Temporary Accommodation detail',
}

describe('ReferralHistoryDetails', () => {
  const application = applicationFactory.build()

  describe('body', () => {
    it('sets the body', () => {
      const page = new ReferralHistoryDetails(body, application)

      expect(page.body).toEqual(body)
    })
  })

  itShouldHavePreviousValue(new ReferralHistoryDetails({}, application), 'referrals-previously-submitted')
  itShouldHaveNextValue(new ReferralHistoryDetails({}, application), '')

  describe('errors', () => {
    it('returns an empty object if the referral history details are populated', () => {
      const page = new ReferralHistoryDetails(body, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an error if the accommodation types array is undefined', () => {
      const page = new ReferralHistoryDetails({ accommodationTypes: undefined }, application)
      expect(page.errors()).toEqual({
        accommodationTypes: 'You must specify what type of accommodation the referral was for',
      })
    })

    it('returns an error if the accommodation types array is empty', () => {
      const page = new ReferralHistoryDetails({ accommodationTypes: [] }, application)
      expect(page.errors()).toEqual({
        accommodationTypes: 'You must specify what type of accommodation the referral was for',
      })
    })

    it('returns errors if the accommodation types array is populated but the associated details are not present', () => {
      const page = new ReferralHistoryDetails({ ...body, dtrDetail: undefined, cas3Detail: undefined }, application)
      expect(page.errors()).toEqual({
        dtrDetail: 'You must provide details on previous local authority (duty to refer) referrals',
        cas3Detail: 'You must provide details on previous Temporary Accommodation referrals',
      })
    })
  })

  describe('response', () => {
    it('returns a translated version of the response', () => {
      const page = new ReferralHistoryDetails(body, application)
      expect(page.response()).toEqual({
        'Local authority (duty to refer)': 'DTR detail',
        'Temporary Accommodation, previously known as CAS3': 'Temporary Accommodation detail',
      })
    })
  })

  describe('items', () => {
    it('returns radio button items with any additional condition detail text', () => {
      const page = new ReferralHistoryDetails(body, application)
      expect(page.items()).toEqual(
        expect.arrayContaining([
          {
            value: 'cas1',
            text: 'Approved Premises',
            detailLabel:
              'Provide details on whether they were offered a place, if they stayed in the accommodation, and what their behaviour was like',
          },
          { value: 'dtr', text: 'Local authority (duty to refer)' },
          { value: 'cas3', text: 'Temporary Accommodation, previously known as CAS3' },
        ]),
      )
    })
  })
})
