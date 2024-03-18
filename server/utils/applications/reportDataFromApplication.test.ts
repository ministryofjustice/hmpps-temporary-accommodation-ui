import {
  dutyToReferLocalAuthorityAreaNameFromApplication,
  dutyToReferSubmissionDateFromApplication,
  eligibilityReasonFromApplication,
  isApplicationEligibleFromApplication,
  isDutyToReferSubmittedFromApplication,
  needsAccessiblePropertyFromApplication,
  personReleaseDateFromApplication,
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
              'dtr-details': { date: '2023-05-24' },
            },
          },
        })
        expect(dutyToReferSubmissionDateFromApplication(application)).toEqual('2023-05-24')
      })

      it('strips the date if it contains whitespace', () => {
        const application = applicationFactory.build({
          data: {
            'accommodation-referral-details': {
              'dtr-submitted': { dtrSubmitted: 'yes' },
              'dtr-details': { date: ' 2023 - 05 - 24 ' },
            },
          },
        })
        expect(dutyToReferSubmissionDateFromApplication(application)).toEqual('2023-05-24')
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

  describe('dutyToReferLocalAuthorityAreaName', () => {
    it('returns the Duty to Refer Local Authority Area Name from the application', () => {
      const application = applicationFactory.build({
        data: {
          'accommodation-referral-details': {
            'dtr-submitted': { dtrSubmitted: 'yes' },
            'dtr-details': { localAuthorityAreaName: 'A local authority area name' },
          },
        },
      })

      expect(dutyToReferLocalAuthorityAreaNameFromApplication(application)).toEqual('A local authority area name')
    })

    it('returns an empty string if the Duty to Refer has not been submitted', () => {
      const application = applicationFactory.build({
        data: {
          'accommodation-referral-details': {
            'dtr-submitted': { dtrSubmitted: 'no' },
          },
        },
      })

      expect(dutyToReferLocalAuthorityAreaNameFromApplication(application)).toEqual('')
    })

    it('throws an error if the Duty to Refer Local Authority Area Name data is not present', () => {
      const application = applicationFactory.build({
        data: {
          'accommodation-referral-details': {},
        },
      })

      expect(() => dutyToReferLocalAuthorityAreaNameFromApplication(application)).toThrow(
        new SessionDataError('No duty to refer submitted data'),
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

  describe('eligibilityReasonFromApplication', () => {
    it('returns reason for application eligibility for CAS3 from the application', () => {
      const application = applicationFactory.build({
        data: {
          eligibility: {
            'eligibility-reason': { reason: 'homelessFromCustody' },
          },
        },
      })
      expect(eligibilityReasonFromApplication(application)).toEqual('homelessFromCustody')
    })

    it('throws an error when the eligibility data is not present', () => {
      const application = applicationFactory.build({
        data: {
          eligibility: {},
        },
      })

      expect(() => eligibilityReasonFromApplication(application)).toThrow(
        new SessionDataError('No application eligibility data'),
      )
    })
  })

  describe('personReleaseDateFromApplication', () => {
    it('returns the person release date from the application', () => {
      const application = applicationFactory.build({
        data: { eligibility: { 'release-date': { releaseDate: '2022-08-09' } } },
      })

      expect(personReleaseDateFromApplication(application)).toEqual('2022-08-09')
    })

    it('strips whitespace from the submitted date', () => {
      const application = applicationFactory.build({
        data: { eligibility: { 'release-date': { releaseDate: ' 2024 -  07 -  03 ' } } },
      })

      expect(personReleaseDateFromApplication(application)).toEqual('2024-07-03')
    })

    it('throws an error if teh person release date is not present', () => {
      const application = applicationFactory.build({
        data: { eligibility: {} },
      })

      expect(() => personReleaseDateFromApplication(application)).toThrow(
        new SessionDataError('No person release date'),
      )
    })
  })
})
