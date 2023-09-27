import {
  dutyToReferSubmissionDateFromApplication,
  isDutyToReferSubmittedFromApplication,
} from './reportDataFromApplication'
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

  describe('dutyToReferSubmissionDateFromApplication', () => {
    describe('when isDutyToReferSubmittedFromApplication is true', () => {
      it('returns the duty to refer submission date from the application', () => {
        const application = applicationFactory.build({
          data: {
            'accommodation-referral-details': {
              'dtr-submitted': { dtrSubmitted: 'yes' },
              'dtr-details': { date: 'Duty of care submission date' },
            },
          },
        })
        expect(dutyToReferSubmissionDateFromApplication(application)).toEqual('Duty of care submission date')
      })
    })

    describe('when isDutyToReferSubmittedFromApplication is false', () => {
      it('returns an empty string', () => {
        const application = applicationFactory.build({
          data: { 'accommodation-referral-details': { 'dtr-submitted': { dtrSubmitted: 'no' } } },
        })
        expect(dutyToReferSubmissionDateFromApplication(application)).toEqual('')
      })
    })

    it('throws an error when the duty to refer submitted date is not known', () => {
      const application = applicationFactory.build({
        data: {
          'accommodation-referral-details': { 'dtr-submitted': { dtrSubmitted: 'yes' } },
        },
      })

      expect(() => dutyToReferSubmissionDateFromApplication(application)).toThrow(
        new SessionDataError('No duty to refer submitted date'),
      )
    })
  })
})
