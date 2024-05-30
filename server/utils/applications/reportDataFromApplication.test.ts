import {
  dutyToReferLocalAuthorityAreaNameFromApplication,
  dutyToReferSubmissionDateFromApplication,
  eligibilityReasonFromApplication,
  hasHistoryOfArsonFromApplication,
  isApplicationEligibleFromApplication,
  isConcerningArsonBehaviourFromApplication,
  isConcerningSexualBehaviourFromApplication,
  isDutyToReferSubmittedFromApplication,
  isHistoryOfSexualOffenceFromApplication,
  isRegisteredSexOffenderFromApplication,
  needsAccessiblePropertyFromApplication,
  personReleaseDateFromApplication,
  releaseTypesFromApplication,
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

  describe('isRegisteredSexOffenderFromApplication', () => {
    it.each([true, false])('returns if the person is a registered sex offender from the application if %s', value => {
      const application = applicationFactory.build({
        data: {
          'offence-and-behaviour-summary': {
            'registered-sex-offender': { registeredSexOffender: value ? 'yes' : 'no' },
          },
        },
      })

      expect(isRegisteredSexOffenderFromApplication(application)).toEqual(value)
    })

    it('returns undefined if not set in the application', () => {
      const application = applicationFactory.build()

      expect(isRegisteredSexOffenderFromApplication(application)).toEqual(undefined)
    })
  })

  describe('isHistoryOfSexualOffenceFromApplication', () => {
    it.each([true, false])(
      'returns if the person has a history of sexual offence from the application if %s',
      value => {
        const application = applicationFactory.build({
          data: {
            'offence-and-behaviour-summary': {
              'history-of-sexual-offence': { historyOfSexualOffence: value ? 'yes' : 'no' },
            },
          },
        })

        expect(isHistoryOfSexualOffenceFromApplication(application)).toEqual(value)
      },
    )

    it('returns undefined if not set in the application', () => {
      const application = applicationFactory.build()

      expect(isHistoryOfSexualOffenceFromApplication(application)).toEqual(undefined)
    })
  })

  describe('isConcerningSexualBehaviourFromApplication', () => {
    it.each([true, false])(
      "returns if there are concerns with the person's sexual behaviour from the application if %s",
      value => {
        const application = applicationFactory.build({
          data: {
            'offence-and-behaviour-summary': {
              'concerning-sexual-behaviour': { concerningSexualBehaviour: value ? 'yes' : 'no' },
            },
          },
        })

        expect(isConcerningSexualBehaviourFromApplication(application)).toEqual(value)
      },
    )

    it('returns undefined if not set in the application', () => {
      const application = applicationFactory.build()

      expect(isConcerningSexualBehaviourFromApplication(application)).toEqual(undefined)
    })
  })

  describe('hasHistoryOfArsonFromApplication', () => {
    it.each([true, false])('returns if the person has a history of arson offence from the application if %s', value => {
      const application = applicationFactory.build({
        data: {
          'offence-and-behaviour-summary': {
            'history-of-arson-offence': { historyOfArsonOffence: value ? 'yes' : 'no' },
          },
        },
      })

      expect(hasHistoryOfArsonFromApplication(application)).toEqual(value)
    })

    it('returns undefined if not set in the application', () => {
      const application = applicationFactory.build()

      expect(hasHistoryOfArsonFromApplication(application)).toEqual(undefined)
    })
  })

  describe('isConcerningArsonBehaviourFromApplication', () => {
    it.each([true, false])(
      "returns if there are concerns with the person's arson behaviour from the application if %s",
      value => {
        const application = applicationFactory.build({
          data: {
            'offence-and-behaviour-summary': {
              'concerning-arson-behaviour': { concerningArsonBehaviour: value ? 'yes' : 'no' },
            },
          },
        })

        expect(isConcerningArsonBehaviourFromApplication(application)).toEqual(value)
      },
    )

    it('returns undefined if not set in the application', () => {
      const application = applicationFactory.build()

      expect(isConcerningArsonBehaviourFromApplication(application)).toEqual(undefined)
    })
  })

  describe('releaseTypesFromApplication', () => {
    it('returns the translated release types', () => {
      const application = applicationFactory.build({
        data: {
          'sentence-information': {
            'release-type': {
              releaseTypes: ['crdLicence', 'ecsl', 'fixedTermRecall', 'standardRecall', 'parole', 'pss'],
            },
          },
        },
      })

      expect(releaseTypesFromApplication(application)).toEqual([
        'CRD licence',
        'ECSL',
        'Fixed-term recall',
        'Standard recall',
        'Parole',
        'PSS',
      ])
    })

    it('returns an empty array if the application release types do not match the latest list', () => {
      const application = applicationFactory.build({
        data: {
          'sentence-information': {
            'release-type': {
              releaseTypes: ['licence', 'pss'],
            },
          },
        },
      })

      expect(releaseTypesFromApplication(application)).toEqual([])
    })
  })
})
