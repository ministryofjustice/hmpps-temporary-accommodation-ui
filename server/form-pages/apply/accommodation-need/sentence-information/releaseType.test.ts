import { applicationFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import ReleaseType, { type ReleaseTypeBody, type ReleaseTypeKey, errorLookups, releaseTypes } from './releaseType'
import dateLabelLookup from '../../../../i18n/en/application/releaseType.json'
import { DateFormats } from '../../../../utils/dateUtils'

const body = {
  releaseTypes: ['fixedTermRecall', 'crdLicence'],
  'fixedTermRecallStartDate-year': '2024',
  'fixedTermRecallStartDate-month': '1',
  'fixedTermRecallStartDate-day': '19',
  'fixedTermRecallEndDate-year': '2024',
  'fixedTermRecallEndDate-month': '7',
  'fixedTermRecallEndDate-day': '9',
  'crdLicenceStartDate-year': '2122',
  'crdLicenceStartDate-month': '4',
  'crdLicenceStartDate-day': '1',
  'crdLicenceEndDate-year': '2122',
  'crdLicenceEndDate-month': '7',
  'crdLicenceEndDate-day': '18',
} as unknown as ReleaseTypeBody

describe('ReleaseType', () => {
  const application = applicationFactory.build()

  describe('body', () => {
    it('sets the body', () => {
      const page = new ReleaseType(body, application)

      expect(page.body).toEqual({
        ...body,
        fixedTermRecallStartDate: '2024-01-19',
        fixedTermRecallEndDate: '2024-07-09',
        crdLicenceStartDate: '2122-04-01',
        crdLicenceEndDate: '2122-07-18',
      })
    })
  })

  itShouldHavePreviousValue(new ReleaseType({}, application), 'sentence-expiry')
  itShouldHaveNextValue(new ReleaseType({}, application), '')

  describe('errors', () => {
    it('returns no errors if fields are populated correctly', () => {
      const page = new ReleaseType(body, application)
      expect(page.errors()).toEqual({})
    })

    it.each(Object.keys(releaseTypes))(
      'returns no error if the %s release type is specified and only the %s dates are specified',
      (key: ReleaseTypeKey) => {
        const bodyOneType = {
          releaseTypes: [key],
          [`${key}StartDate-year`]: '2122',
          [`${key}StartDate-month`]: '4',
          [`${key}StartDate-day`]: '1',
          [`${key}EndDate-year`]: '2122',
          [`${key}EndDate-month`]: '7',
          [`${key}EndDate-day`]: '18',
        } as ReleaseTypeBody

        const page = new ReleaseType(bodyOneType, application)

        expect(page.errors()).toEqual({})
      },
    )

    it.each(Object.keys(releaseTypes))(
      'returns date required errors if the %s release type is specified and the %s dates are blank',
      (key: ReleaseTypeKey) => {
        const bodyMissingDates = {
          releaseTypes: [key],
        } as ReleaseTypeBody

        const page = new ReleaseType(bodyMissingDates, application)

        expect(page.errors()).toEqual({
          [`${key}StartDate`]: errorLookups.application.releaseType[key].dates.emptyStartDate,
          [`${key}EndDate`]: errorLookups.application.releaseType[key].dates.emptyEndDate,
        })
      },
    )

    it.each(Object.keys(releaseTypes))(
      'returns date invalid errors if the %s release type is specified and the %s dates are invalid',
      (key: ReleaseTypeKey) => {
        const bodyInvalidDates = {
          releaseTypes: [key],
          [`${key}StartDate-year`]: '202',
          [`${key}StartDate-month`]: '44',
          [`${key}StartDate-day`]: '43',
          [`${key}EndDate-year`]: '2024',
          [`${key}EndDate-month`]: '13',
          [`${key}EndDate-day`]: '18',
        } as unknown as ReleaseTypeBody

        const page = new ReleaseType(bodyInvalidDates, application)

        expect(page.errors()).toEqual({
          [`${key}StartDate`]: errorLookups.application.releaseType[key].dates.invalidStartDate,
          [`${key}EndDate`]: errorLookups.application.releaseType[key].dates.invalidEndDate,
        })
      },
    )

    it.each(Object.keys(releaseTypes))(
      'returns an error if the %s release type is specified and the end date is before the start date',
      (key: ReleaseTypeKey) => {
        const bodyDates = {
          releaseTypes: [key],
          [`${key}StartDate-year`]: '2025',
          [`${key}StartDate-month`]: '4',
          [`${key}StartDate-day`]: '3',
          [`${key}EndDate-year`]: '2024',
          [`${key}EndDate-month`]: '4',
          [`${key}EndDate-day`]: '3',
        } as unknown as ReleaseTypeBody

        const page = new ReleaseType(bodyDates, application)

        expect(page.errors()).toEqual({
          [`${key}EndDate`]: errorLookups.application.releaseType[key].dates.beforeStartDate,
        })
      },
    )

    it('returns an error if release types are not specified', () => {
      const page = new ReleaseType({}, application)

      expect(page.errors()).toEqual({
        releaseTypes: 'Select the release type',
      })
    })

    it('returns an error if release types are empty', () => {
      const page = new ReleaseType({ releaseTypes: [] } as ReleaseTypeBody, application)

      expect(page.errors()).toEqual({
        releaseTypes: 'Select the release type',
      })
    })

    it('returns an error if more than two release types are selected', () => {
      const page = new ReleaseType(
        {
          releaseTypes: ['fixedTermRecall', 'parole', 'standardRecall'],
        } as ReleaseTypeBody,
        application,
      )

      expect(page.errors()).toEqual({
        releaseTypes: 'You can select a maximum of 2 release types',
      })
    })

    describe.each([
      ['standardRecall', ['fixedTermRecall'], 'Standard recall cannot be combined with Fixed-term recall'],
      [
        'fixedTermRecall',
        ['parole', 'standardRecall', 'riskAssessedRecallReview', 'indeterminatePublicProtectionRarr'],
        'Fixed-term recall cannot be combined with Parole, Standard recall, RARR, or IPP RARR',
      ],
      ['crdLicence', ['parole', 'indeterminatePublicProtectionRarr'], 'CRD cannot be combined with Parole or IPP RARR'],
      [
        'indeterminatePublicProtectionRarr',
        ['crdLicence', 'fixedTermRecall', 'riskAssessedRecallReview', 'pss'],
        'IPP RARR cannot be combined with CRD, Fixed-term recall, RARR, or PSS',
      ],
      [
        'riskAssessedRecallReview',
        ['fixedTermRecall', 'indeterminatePublicProtectionRarr', 'pss'],
        'RARR cannot be combined with Fixed-term recall, IPP RARR, or PSS',
      ],
      [
        'parole',
        ['crdLicence', 'fixedTermRecall', 'pss'],
        'Parole cannot be combined with CRD, Fixed-term recall, or PSS',
      ],
      [
        'pss',
        ['parole', 'riskAssessedRecallReview', 'indeterminatePublicProtectionRarr'],
        'PSS cannot be combined with Parole, RARR, or IPP RARR',
      ],
    ])(
      'when %s is selected',
      (primaryReleaseType: ReleaseTypeKey, incompatibleReleaseTypes: Array<ReleaseTypeKey>, expectedError: string) => {
        it.each(incompatibleReleaseTypes)(
          `returns an error when combined with %s`,
          (incompatibleReleaseType: ReleaseTypeKey) => {
            const page = new ReleaseType(
              { releaseTypes: [primaryReleaseType, incompatibleReleaseType] } as ReleaseTypeBody,
              application,
            )
            expect(page.errors()).toEqual({ releaseTypes: expectedError })
          },
        )
      },
    )

    it('does not return error if one recall licence checkboxes are selected and other release types', () => {
      const page = new ReleaseType({ releaseTypes: ['fixedTermRecall', 'parole'] } as ReleaseTypeBody, application)

      expect(page.errors()).not.toEqual({
        releaseTypes: 'Select one type of recall licence',
      })
    })

    it('returns a single error if an old release type is submitted', () => {
      const page = new ReleaseType({ releaseTypes: ['licence'] } as ReleaseTypeBody, application)

      expect(page.errors()).toEqual({
        releaseTypes: 'Select the release type',
      })
    })

    it('returns a single error if an old release type is submitted with current release types', () => {
      const page = new ReleaseType(
        { releaseTypes: ['fixedTermRecall', 'parole', 'fourteenDayFixedTermRecall'] } as ReleaseTypeBody,
        application,
      )

      expect(page.errors()).toEqual({
        releaseTypes: 'Select the release type',
      })
    })

    it('does not error for releaseTypes in optionsToExclude', () => {
      const page = new ReleaseType({ releaseTypes: ['ecsl'] } as ReleaseTypeBody, application)
      expect(page.errors()).toEqual({})
    })
  })

  describe('response', () => {
    it('returns a translated version of the response', () => {
      const page = new ReleaseType(body, application)

      expect(page.response()).toEqual({
        'What is the release type?': 'Fixed-term Recall\nConditional release date (CRD)',
        'Licence start date': '19 January 2024',
        'Licence end date': '9 July 2024',
        'CRD start date': '1 April 2122',
        'CRD end date': '18 July 2122',
      })
    })

    it('does not display invalid release types', () => {
      const oldBody = {
        releaseTypes: ['licence'],
      }
      const page = new ReleaseType(oldBody as unknown as ReleaseTypeBody, application)

      expect(page.response()).toEqual({
        'What is the release type?': '',
      })
    })
  })

  describe('currentReleaseTypeOptions', () => {
    it('renders the current options of release types for the view', () => {
      const page = new ReleaseType(body, application)

      const expectedReleaseTypeOptions = [
        {
          name: 'Conditional release date (CRD)',
          value: 'crdLicence',
        },
        {
          name: 'Parole',
          value: 'parole',
        },
        {
          name: 'Fixed-term Recall',
          value: 'fixedTermRecall',
        },
        {
          name: 'Standard Recall',
          value: 'standardRecall',
        },
        {
          name: 'Risk Assessed Recall Review (RARR)',
          value: 'riskAssessedRecallReview',
        },
        {
          name: 'Indeterminate Public Protection (IPP RARR)',
          value: 'indeterminatePublicProtectionRarr',
        },
      ]

      // only add pss before 30th April 2026
      if (new Date() < DateFormats.isoToDateObj('2026-04-30')) {
        expectedReleaseTypeOptions.push({
          name: 'Post Sentence Supervision (PSS)',
          value: 'pss',
        })
      }

      expect(page.currentReleaseTypeOptions()).toEqual(expectedReleaseTypeOptions)
    })

    it('includes an excluded option if it is present in the current body', () => {
      releaseTypes.ecsl = { text: 'Excluded Option', abbr: 'ECSL' }

      const page = new ReleaseType({ releaseTypes: ['ecsl'] } as ReleaseTypeBody, application)

      expect(page.currentReleaseTypeOptions()).toEqual(
        expect.arrayContaining([expect.objectContaining({ value: 'ecsl', name: 'Excluded Option' })]),
      )

      delete releaseTypes.ecsl
    })
  })

  describe('dateLabels', () => {
    it.each(Object.keys(releaseTypes))(
      'returns custom label for start date for %s release type ',
      (key: ReleaseTypeKey) => {
        const page = new ReleaseType({}, application)

        expect(page.dateLabels(key as unknown as ReleaseType)).toEqual(
          dateLabelLookup.labels[`${key}StartDate` as never],
        )
      },
    )
  })
})
