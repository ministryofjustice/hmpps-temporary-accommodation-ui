import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../shared-examples'

import PlacementDate from './placementDate'

describe('PlacementDate', () => {
  describe('body', () => {
    it('should strip unknown attributes from the body', () => {
      const page = new PlacementDate({
        startDateSameAsReleaseDate: 'no',
        'startDate-year': 2020,
        'startDate-month': 12,
        'startDate-day': 1,
        something: 'else',
      })

      expect(page.body).toEqual({
        startDateSameAsReleaseDate: 'no',
        'startDate-year': 2020,
        'startDate-month': 12,
        'startDate-day': 1,
      })
    })
  })

  itShouldHaveNextValue(new PlacementDate({}), '')
  itShouldHavePreviousValue(new PlacementDate({}), 'oral-hearing')

  describe('errors', () => {
    it('should return an empty array if the release date is the same as the start date', () => {
      const page = new PlacementDate({
        startDateSameAsReleaseDate: 'yes',
      })
      expect(page.errors()).toEqual([])
    })

    describe('if the start date is not the same as the release date', () => {
      it('should return an empty array if the date is specified', () => {
        const page = new PlacementDate({
          startDateSameAsReleaseDate: 'no',
          'startDate-year': 2020,
          'startDate-month': 12,
          'startDate-day': 1,
        })
        expect(page.errors()).toEqual([])
      })

      it('should return an error if the date is not specified', () => {
        const page = new PlacementDate({
          startDateSameAsReleaseDate: 'no',
        })
        expect(page.errors()).toEqual([
          {
            propertyName: 'startDate',
            errorType: 'blank',
          },
        ])
      })

      it('should return an error if the date is invalid', () => {
        const page = new PlacementDate({
          startDateSameAsReleaseDate: 'no',
          'startDate-year': 999999,
          'startDate-month': 99999,
          'startDate-day': 9999,
        })
        expect(page.errors()).toEqual([
          {
            propertyName: 'startDate',
            errorType: 'invalid',
          },
        ])
      })
    })

    it('should return an error if the startDateSameAsReleaseDate field is not populated', () => {
      const page = new PlacementDate({})
      expect(page.errors()).toEqual([
        {
          propertyName: 'startDateSameAsReleaseDate',
          errorType: 'blank',
        },
      ])
    })
  })
})
