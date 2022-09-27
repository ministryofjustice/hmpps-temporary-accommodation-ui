import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../shared-examples'

import ReleaseDate from './releaseDate'

describe('ReleaseDate', () => {
  describe('body', () => {
    it('should strip unknown attributes from the body', () => {
      const page = new ReleaseDate(
        {
          knowReleaseDate: 'yes',
          'releaseDate-year': 2022,
          'releaseDate-month': 3,
          'releaseDate-day': 3,
          something: 'else',
        },
        {},
        'previousPage',
      )

      expect(page.body).toEqual({
        knowReleaseDate: 'yes',
        'releaseDate-year': 2022,
        'releaseDate-month': 3,
        'releaseDate-day': 3,
      })
    })
  })

  describe('when knowReleaseDate is set to yes', () => {
    itShouldHaveNextValue(new ReleaseDate({ knowReleaseDate: 'yes' }, {}, 'somePage'), 'placement-date')
  })

  describe('when knowReleaseDate is set to no', () => {
    itShouldHaveNextValue(new ReleaseDate({ knowReleaseDate: 'no' }, {}, 'somePage'), 'oral-hearing')
  })

  describe("previous returns the value passed into the previousPage parameter of the object's constructor", () => {
    itShouldHavePreviousValue(new ReleaseDate({}, {}, 'previousPage'), 'previousPage')
  })

  describe('errors', () => {
    describe('if the user knows the release date', () => {
      it('should return an empty array if the date is specified', () => {
        const page = new ReleaseDate(
          {
            knowReleaseDate: 'yes',
            'releaseDate-year': 2022,
            'releaseDate-month': 3,
            'releaseDate-day': 3,
          },
          {},
          'somePage',
        )
        expect(page.errors()).toEqual([])
      })

      it('should return an error if  the date is not populated', () => {
        const page = new ReleaseDate(
          {
            knowReleaseDate: 'yes',
          },
          {},
          'somePage',
        )
        expect(page.errors()).toEqual([
          {
            propertyName: '$.releaseDate',
            errorType: 'empty',
          },
        ])
      })

      it('should return an error if the date is invalid', () => {
        const page = new ReleaseDate(
          {
            knowReleaseDate: 'yes',
            'releaseDate-year': 99,
            'releaseDate-month': 99,
            'releaseDate-day': 99,
          },
          {},
          'somePage',
        )
        expect(page.errors()).toEqual([
          {
            propertyName: '$.releaseDate',
            errorType: 'invalid',
          },
        ])
      })
    })

    it('should return an empty array if the user does not know the release date', () => {
      const page = new ReleaseDate(
        {
          knowReleaseDate: 'no',
        },
        {},
        'somePage',
      )
      expect(page.errors()).toEqual([])
    })

    it('should return an error if the knowReleaseDate field is not populated', () => {
      const page = new ReleaseDate({}, {}, 'somePage')
      expect(page.errors()).toEqual([
        {
          propertyName: '$.knowReleaseDate',
          errorType: 'empty',
        },
      ])
    })
  })
})
