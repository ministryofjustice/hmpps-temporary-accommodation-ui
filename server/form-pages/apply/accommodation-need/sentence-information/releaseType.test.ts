import { applicationFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import ReleaseType, { type ReleaseTypeBody, type ReleaseTypeKey, errorLookups, releaseTypes } from './releaseType'
import dateLabelLookup from '../../../../i18n/en/application/releaseType.json'

const body = {
  releaseTypes: ['fixedTermRecall', 'parole'],
  'fixedTermRecallStartDate-year': '2024',
  'fixedTermRecallStartDate-month': '1',
  'fixedTermRecallStartDate-day': '19',
  'fixedTermRecallEndDate-year': '2024',
  'fixedTermRecallEndDate-month': '7',
  'fixedTermRecallEndDate-day': '9',
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
        fixedTermRecallStartDate: '2024-01-19',
        fixedTermRecallEndDate: '2024-07-09',
        paroleStartDate: '2122-04-01',
        paroleEndDate: '2122-07-18',
      })
    })

    it('excludes invalid or old release types', () => {
      const oldBody = {
        releaseTypes: ['licence'],
        'licenceStartDate-year': '2024',
        'licenceStartDate-month': '1',
        'licenceStartDate-day': '19',
        'licenceEndDate-year': '2024',
        'licenceEndDate-month': '7',
        'licenceEndDate-day': '9',
      } as unknown as ReleaseTypeBody
      const page = new ReleaseType(oldBody, application)

      expect(page.body).toEqual({
        releaseTypes: [],
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
        releaseTypes: 'You must specify the release types',
      })
    })

    it('returns an error if release types are empty', () => {
      const page = new ReleaseType({ releaseTypes: [] } as ReleaseTypeBody, application)

      expect(page.errors()).toEqual({
        releaseTypes: 'You must specify the release types',
      })
    })

    it('returns an error if more than one recall licence checkboxes are selected', () => {
      const page = new ReleaseType(
        {
          releaseTypes: [
            'fixedTermRecall',
            'standardRecall',
            'nonPresumptiveRarr',
            'presumptiveRarr',
            'indeterminatePublicProtectionRarr',
          ],
        } as ReleaseTypeBody,
        application,
      )

      expect(page.errors()).toEqual({
        releaseTypes: 'Select one type of recall or RARR licence',
      })
    })

    it('returns does not return error if one recall licence checkboxes are selected and other release types', () => {
      const page = new ReleaseType({ releaseTypes: ['fixedTermRecall', 'parole'] } as ReleaseTypeBody, application)

      expect(page.errors()).not.toEqual({
        releaseTypes: 'Select one type of recall licence',
      })
    })

    describe('when Parole selected along with either CRD or PSS', () => {
      it.each([
        ['Parole and CRD licence', ['parole', 'crdLicence']],
        ['Parole and PSS', ['parole', 'pss']],
        ['Parole, CRD licence and PSS', ['parole', 'crdLicence', 'pss']],
      ])('returns an error if %s are selected', (_, selected: Array<ReleaseTypeKey>) => {
        const page = new ReleaseType({ releaseTypes: selected } as ReleaseTypeBody, application)

        expect(page.errors()).toEqual({
          releaseTypes: 'Parole cannot be selected alongside the CRD licence or PSS',
        })
      })
    })

    describe('when CRD Licence and one recall type selected', () => {
      it.each([
        ['CRD licence and Fixed-term recall', ['crdLicence', 'fixedTermRecall']],
        ['CRD licence and standard recall', ['crdLicence', 'standardRecall']],
        ['CRD licence and Non-Presumptive RARR', ['crdLicence', 'nonPresumptiveRarr']],
        ['CRD licence and  Presumptive RARR', ['crdLicence', 'presumptiveRarr']],
        ['CRD licence and Indeterminate Public Protection RARR', ['crdLicence', 'indeterminatePublicProtectionRarr']],
      ])('returns an error if %s are selected', (_, selected: Array<ReleaseTypeKey>) => {
        const page = new ReleaseType({ releaseTypes: selected } as ReleaseTypeBody, application)

        expect(page.errors()).toEqual({
          releaseTypes: 'You cannot select CRD licence alongside a recall or RARR licence',
        })
      })
    })

    it('returns a single error if an old release type is submitted', () => {
      const page = new ReleaseType({ releaseTypes: ['licence'] } as ReleaseTypeBody, application)

      expect(page.errors()).toEqual({
        releaseTypes: 'You must specify the release types',
      })
    })
  })

  describe('response', () => {
    it('returns a translated version of the response', () => {
      const page = new ReleaseType(body, application)

      expect(page.response()).toEqual({
        'What is the release type?': 'Licence following fixed-term recall\nParole',
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
          name: 'Conditional release date (CRD) licence',
          value: 'crdLicence',
        },
        {
          name: 'Licence following fixed-term recall',
          value: 'fixedTermRecall',
        },
        {
          name: 'Licence following standard recall',
          value: 'standardRecall',
        },
        {
          name: 'Licence following Non-Presumptive Risk Assessed Recall Review (NP-RARR)',
          value: 'nonPresumptiveRarr',
        },
        {
          name: 'Licence following Presumptive RARR',
          value: 'presumptiveRarr',
        },
        {
          name: 'Licence following Indeterminate Public Protection RARR',
          value: 'indeterminatePublicProtectionRarr',
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
