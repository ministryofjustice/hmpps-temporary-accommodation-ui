import {
  dutyToReferSubmissionDateFromApplication,
  isApplicationEligibleFromApplication,
  isDutyToReferSubmittedFromApplication,
  needsAccessiblePropertyFromApplication,
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

  describe('needsAccessiblePropertyFromApplication', () => {
    it('returns data for whether the application is for an accessible property from the application', () => {
      const application = applicationFactory.build({
        data: {
          'disability-cultural-and-specific-needs': {
            'property-attributes-or-adaptations': { propertyAttributesOrAdaptations: 'yes' },
          },
        },
      })
      expect(needsAccessiblePropertyFromApplication(application)).toEqual(true)
    })

    it('throws an error when the accessible property data is not present', () => {
      const application = applicationFactory.build({
        data: {
          'disability-cultural-and-specific-needs': {},
        },
      })

      expect(() => needsAccessiblePropertyFromApplication(application)).toThrow(
        new SessionDataError('No accessible property data'),
      )
    })
  })

  describe('isApplicationEligibleFromApplication', () => {
    it('returns whether the application is eligible for CAS3 from the application', () => {
      const application = applicationFactory.build({
        data: {
          eligibility: {
            'eligibility-reason': { reason: 'homelessFromCustody' },
          },
        },
      })
      expect(isApplicationEligibleFromApplication(application)).toEqual(true)
    })

    it('throws an error when the eligibility data is not present', () => {
      const application = applicationFactory.build({
        data: {
          eligibility: {},
        },
      })

      expect(() => isApplicationEligibleFromApplication(application)).toThrow(
        new SessionDataError('No application eligibility data'),
      )
    })
  })
})
