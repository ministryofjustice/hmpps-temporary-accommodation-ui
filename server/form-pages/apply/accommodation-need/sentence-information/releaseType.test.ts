import { applicationFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import ReleaseType, { type ReleaseTypeBody, type ReleaseTypeKey, errorLookups, releaseTypes } from './releaseType'
import dateLabelLookup from '../../../../i18n/en/application/releaseType.json'

const body = {
  releaseTypes: ['fourteenDayFixedTermRecall', 'parole'],
  'fourteenDayFixedTermRecallStartDate-year': '2024',
  'fourteenDayFixedTermRecallStartDate-month': '1',
  'fourteenDayFixedTermRecallStartDate-day': '19',
  'fourteenDayFixedTermRecallEndDate-year': '2024',
  'fourteenDayFixedTermRecallEndDate-month': '7',
  'fourteenDayFixedTermRecallEndDate-day': '9',
  'paroleStartDate-year': '2122',
  'paroleStartDate-month': '4',
  'paroleStartDate-day': '1',
  'paroleEndDate-year': '2122',
  'paroleEndDate-month': '7',
  'paroleEndDate-day': '18',
} as unknown as ReleaseTypeBody

describe('ReleaseType', () => {
  const application = applicationFactory.build()

  describe('body', () => {
    it('sets the body', () => {
      const page = new ReleaseType(body, application)

      expect(page.body).toEqual({
        ...body,
        fourteenDayFixedTermRecallStartDate: '2024-01-19',
        fourteenDayFixedTermRecallEndDate: '2024-07-09',
        paroleStartDate: '2122-04-01',
        paroleEndDate: '2122-07-18',
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
          releaseTypes: ['fourteenDayFixedTermRecall', 'twentyEightDayFixedTermRecall', 'parole'],
        } as ReleaseTypeBody,
        application,
      )

      expect(page.errors()).toEqual({
        releaseTypes: 'You can select a maximum of 2 release types',
      })
    })

    it('returns an error if more than one recall or RARR licence checkboxes are selected', () => {
      const recallTypeKeys = [
        'fourteenDayFixedTermRecall',
        'twentyEightDayFixedTermRecall',
        'standardRecall',
        'nonPresumptiveRarr',
        'presumptiveRarr',
        'indeterminatePublicProtectionRarr',
      ] as ReleaseTypeKey[]

      for (let i = 0; i < recallTypeKeys.length; i += 1) {
        for (let j = i + 1; j < recallTypeKeys.length; j += 1) {
          const page = new ReleaseType(
            { releaseTypes: [recallTypeKeys[i], recallTypeKeys[j]] } as ReleaseTypeBody,
            application,
          )
          expect(page.errors()).toEqual({
            releaseTypes: 'Only one recall or one RARR licence can be selected',
          })
        }
      }
    })

    it('returns does not return error if one recall licence checkboxes are selected and other release types', () => {
      const page = new ReleaseType(
        { releaseTypes: ['fourteenDayFixedTermRecall', 'parole'] } as ReleaseTypeBody,
        application,
      )

      expect(page.errors()).not.toEqual({
        releaseTypes: 'Select one type of recall licence',
      })
    })

    describe('when Parole selected along with PSS', () => {
      it.each([['Parole and PSS', ['parole', 'pss']]])(
        'returns an error if %s are selected',
        (_, selected: Array<ReleaseTypeKey>) => {
          const page = new ReleaseType({ releaseTypes: selected } as ReleaseTypeBody, application)

          expect(page.errors()).toEqual({
            releaseTypes: 'Parole cannot be combined with post sentence supervision (PSS)',
          })
        },
      )
    })

    describe('when CRD Licence and one recall type selected', () => {
      it.each([
        ['CRD licence and 14-day fixed-term recall', ['crdLicence', 'fourteenDayFixedTermRecall']],
        ['CRD licence and 28-day fixed-term recall', ['crdLicence', 'twentyEightDayFixedTermRecall']],
        ['CRD licence and standard recall', ['crdLicence', 'standardRecall']],
        ['CRD licence and Non-Presumptive RARR', ['crdLicence', 'nonPresumptiveRarr']],
        ['CRD licence and Presumptive RARR', ['crdLicence', 'presumptiveRarr']],
        ['CRD licence and Indeterminate Public Protection RARR', ['crdLicence', 'indeterminatePublicProtectionRarr']],
      ])('returns an error if %s are selected', (_, selected: Array<ReleaseTypeKey>) => {
        const page = new ReleaseType({ releaseTypes: selected } as ReleaseTypeBody, application)

        expect(page.errors()).toEqual({
          releaseTypes: 'CRD licence cannot be combined with parole, recall or RARR licences',
        })
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
        'What is the release type?': '14-day fixed-term recall release licence\nParole',
        'Licence start date': '19 January 2024',
        'Licence end date': '9 July 2024',
        'Parole start date': '1 April 2122',
        'Parole end date': '18 July 2122',
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

      expect(page.currentReleaseTypeOptions()).toEqual([
        {
          name: '14-day fixed-term recall release licence',
          value: 'fourteenDayFixedTermRecall',
        },
        {
          name: '28-day fixed-term recall release licence',
          value: 'twentyEightDayFixedTermRecall',
        },
        {
          name: 'Standard recall release licence',
          value: 'standardRecall',
        },
        {
          name: 'Conditional release date (CRD) licence',
          value: 'crdLicence',
        },
        {
          name: 'Indeterminate Public Protection RARR release licence',
          value: 'indeterminatePublicProtectionRarr',
        },
        {
          name: 'Non-Presumptive Risk Assessed Recall Review (NP-RARR) release licence',
          value: 'nonPresumptiveRarr',
        },
        {
          name: 'Presumptive RARR release licence',
          value: 'presumptiveRarr',
        },
        {
          name: 'Parole',
          value: 'parole',
        },
        {
          name: 'Post sentence supervision (PSS)',
          value: 'pss',
        },
      ])
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
