import { isDutyToReferSubmittedFromApplication } from './reportDataFromApplication'
import { applicationFactory } from '../../testutils/factories'
import { SessionDataError } from '../errors'

describe('reportDataFromApplication', () => {
  describe('isDutyToReferSubmittedFromApplication', () => {
    it('returns data for whether the duty to refer has been submitted from the application', () => {
      const application = applicationFactory.build({
        data: { 'accommodation-referral-details': { 'dtr-submitted': { dtrSubmitted: 'yes' } } },
      })
      expect(isDutyToReferSubmittedFromApplication(application)).toEqual(true)
    })

    it('throws an error when the duty to refer submitted data is not known', () => {
      const application = applicationFactory.build({
        data: {
          'accommodation-referral-details': {},
        },
      })

      expect(() => isDutyToReferSubmittedFromApplication(application)).toThrow(
        new SessionDataError('No duty to refer submitted data'),
      )
    })
  })
})
