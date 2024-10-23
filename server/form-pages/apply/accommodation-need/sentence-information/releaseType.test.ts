import { applicationFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import ReleaseType, { type ReleaseTypeBody, type ReleaseTypeKey, releaseTypes } from './releaseType'

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
          [`${key}StartDate`]: `You must specify the ${releaseTypes[key].abbr} start date`,
          [`${key}EndDate`]: `You must specify the ${releaseTypes[key].abbr} end date`,
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
          [`${key}StartDate`]: `You must specify a valid ${releaseTypes[key].abbr} start date`,
          [`${key}EndDate`]: `You must specify a valid ${releaseTypes[key].abbr} end date`,
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

    it('returns an error if both licence checkboxes are selected', () => {
      const page = new ReleaseType(
        { releaseTypes: ['fixedTermRecall', 'standardRecall'] } as ReleaseTypeBody,
        application,
      )

      expect(page.errors()).toEqual({
        releaseTypes: 'Select one type of recall licence',
      })
    })

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
        'What is the release type?': 'Fixed-term recall\nParole',
        'Fixed-term recall start date': '19 January 2024',
        'Fixed-term recall end date': '9 July 2024',
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

  describe('getReleaseTypeOptions', () => {
    it('renders the options as an object for the template', () => {
      const page = new ReleaseType(body, application)

      expect(page.getReleaseTypeOptions()).toEqual([
        {
          name: 'Conditional release date (CRD) licence',
          value: 'crdLicence',
        },
        {
          name: 'End of custody supervised licence (ECSL)',
          value: 'ecsl',
        },
        {
          name: 'Licence, following fixed-term recall',
          value: 'fixedTermRecall',
        },
        {
          name: 'Licence, following standard recall',
          value: 'standardRecall',
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

  describe('currentReleaseTypeOptions', () => {
    it('renders the current options of release types for the view', () => {
      const page = new ReleaseType(body, application)

      expect(page.currentReleaseTypeOptions()).toEqual([
        {
          name: 'Conditional release date (CRD) licence',
          value: 'crdLicence',
        },
        {
          name: 'Licence, following fixed-term recall',
          value: 'fixedTermRecall',
        },
        {
          name: 'Licence, following standard recall',
          value: 'standardRecall',
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

    it('renders the current options include previous selected option for the view', () => {
      const bodyWithPreviousReleaseType = {
        releaseTypes: ['ecsl', 'parole'],
        'ecslStartDate-year': '2024',
        'ecslStartDate-month': '1',
        'ecslStartDate-day': '19',
        'ecsllEndDate-year': '2024',
        'ecslEndDate-month': '7',
        'ecslEndDate-day': '9',
        'paroleStartDate-year': '2122',
        'paroleStartDate-month': '4',
        'paroleStartDate-day': '1',
        'paroleEndDate-year': '2122',
        'paroleEndDate-month': '7',
        'paroleEndDate-day': '18',
      } as unknown as ReleaseTypeBody
      const page = new ReleaseType(bodyWithPreviousReleaseType, application)

      expect(page.currentReleaseTypeOptions()).toEqual([
        {
          name: 'Conditional release date (CRD) licence',
          value: 'crdLicence',
        },
        {
          name: 'End of custody supervised licence (ECSL)',
          value: 'ecsl',
        },
        {
          name: 'Licence, following fixed-term recall',
          value: 'fixedTermRecall',
        },
        {
          name: 'Licence, following standard recall',
          value: 'standardRecall',
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
})
