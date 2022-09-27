import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../shared-examples'

import PlacementDate from './placementDate'
import { DateFormats } from '../../../utils/dateUtils'

describe('PlacementDate', () => {
  const releaseDate = new Date().toISOString()
  const session = { 'basic-information': { 'release-date': { releaseDate } } }

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
        session,
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

  itShouldHaveNextValue(new PlacementDate({}, session), '')
  itShouldHavePreviousValue(new PlacementDate({}, session), 'oral-hearing')

  describe('errors', () => {
    it('should return an empty array if the release date is the same as the start date', () => {
      const page = new PlacementDate(
        {
          startDateSameAsReleaseDate: 'yes',
        },
        session,
      )
      expect(page.errors()).toEqual([])
    })

    describe('if the start date is not the same as the release date', () => {
      it('should return an empty array if the date is specified', () => {
        const page = new PlacementDate(
          {
            startDateSameAsReleaseDate: 'no',
            'startDate-year': 2020,
            'startDate-month': 12,
            'startDate-day': 1,
          },
          session,
        )
        expect(page.errors()).toEqual([])
      })

      it('should return an error if the date is not specified', () => {
        const page = new PlacementDate(
          {
            startDateSameAsReleaseDate: 'no',
          },
          session,
        )
        expect(page.errors()).toEqual([
          {
            propertyName: '$.startDate',
            errorType: 'empty',
          },
        ])
      })

      it('should return an error if the date is invalid', () => {
        const page = new PlacementDate(
          {
            startDateSameAsReleaseDate: 'no',
            'startDate-year': 999999,
            'startDate-month': 99999,
            'startDate-day': 9999,
          },
          session,
        )
        expect(page.errors()).toEqual([
          {
            propertyName: '$.startDate',
            errorType: 'invalid',
          },
        ])
      })
    })

    it('should return an error if the startDateSameAsReleaseDate field is not populated', () => {
      const page = new PlacementDate({}, session)
      expect(page.errors()).toEqual([
        {
          propertyName: '$.startDateSameAsReleaseDate',
          errorType: 'empty',
        },
      ])
    })
  })
})
