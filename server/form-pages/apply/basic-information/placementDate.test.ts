import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../shared-examples'

import PlacementDate from './placementDate'
import { DateFormats } from '../../../utils/dateUtils'
import applicationFactory from '../../../testutils/factories/application'

describe('PlacementDate', () => {
  const releaseDate = new Date().toISOString()
  const application = applicationFactory.build({ data: { 'basic-information': { 'release-date': { releaseDate } } } })

  describe('title and body', () => {
    it('should strip unknown attributes from the body', () => {
      const page = new PlacementDate(
        {
          startDateSameAsReleaseDate: 'no',
          'startDate-year': 2020,
          'startDate-month': 12,
          'startDate-day': 1,
          something: 'else',
        },
        application,
      )

      expect(page.body).toEqual({
        startDateSameAsReleaseDate: 'no',
        'startDate-year': 2020,
        'startDate-month': 12,
        'startDate-day': 1,
      })
      expect(page.title).toEqual(
        `Is ${DateFormats.isoDateToUIDate(releaseDate)} the date you want the placement to start?`,
      )
    })
  })

  itShouldHaveNextValue(new PlacementDate({}, application), 'placement-purpose')
  itShouldHavePreviousValue(new PlacementDate({}, application), 'oral-hearing')

  describe('errors', () => {
    it('should return an empty object if the release date is the same as the start date', () => {
      const page = new PlacementDate(
        {
          startDateSameAsReleaseDate: 'yes',
        },
        application,
      )
      expect(page.errors()).toEqual({})
    })

    describe('if the start date is not the same as the release date', () => {
      it('should return an empty object if the date is specified', () => {
        const page = new PlacementDate(
          {
            startDateSameAsReleaseDate: 'no',
            'startDate-year': 2020,
            'startDate-month': 12,
            'startDate-day': 1,
          },
          application,
        )
        expect(page.errors()).toEqual({})
      })

      it('should return an error if the date is not specified', () => {
        const page = new PlacementDate(
          {
            startDateSameAsReleaseDate: 'no',
          },
          application,
        )
        expect(page.errors()).toEqual({ startDate: 'You must enter a start date' })
      })

      it('should return an error if the date is invalid', () => {
        const page = new PlacementDate(
          {
            startDateSameAsReleaseDate: 'no',
            'startDate-year': 999999,
            'startDate-month': 99999,
            'startDate-day': 9999,
          },
          application,
        )
        expect(page.errors()).toEqual({ startDate: 'The start date is an invalid date' })
      })
    })

    it('should return an error if the startDateSameAsReleaseDate field is not populated', () => {
      const page = new PlacementDate({}, application)
      expect(page.errors()).toEqual({
        startDateSameAsReleaseDate: 'You must specify if the start date is the same as the release date',
      })
    })
  })

  describe('response', () => {
    it('should return a translated version of the response when the start date is the same as the release date', () => {
      const page = new PlacementDate(
        {
          startDateSameAsReleaseDate: 'yes',
        },
        application,
      )

      expect(page.response()).toEqual({
        [page.title]: 'Yes',
      })
    })

    it('should return a translated version of the response when the start date is not the same as the release date', () => {
      const page = new PlacementDate(
        {
          startDateSameAsReleaseDate: 'no',
          startDate: '2022-11-11T00:00:00.000Z',
        },
        application,
      )

      expect(page.response()).toEqual({
        [page.title]: 'No',
        'Placement Start Date': 'Friday 11 November 2022',
      })
    })
  })
})
