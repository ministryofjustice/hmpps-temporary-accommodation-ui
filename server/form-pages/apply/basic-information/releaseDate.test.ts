import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../shared-examples'

import ReleaseDate from './releaseDate'

describe('ReleaseDate', () => {
  describe('body', () => {
    it('should strip unknown attributes from the body', () => {
      const page = new ReleaseDate({
        knowReleaseDate: 'yes',
        'releaseDate-year': 2022,
        'releaseDate-month': 3,
        'releaseDate-day': 3,
        something: 'else',
      })

      expect(page.body).toEqual({
        knowReleaseDate: 'yes',
        'releaseDate-year': 2022,
        'releaseDate-month': 3,
        'releaseDate-day': 3,
      })
    })
  })

  describe('when knowReleaseDate is set to yes', () => {
    itShouldHaveNextValue(new ReleaseDate({ knowReleaseDate: 'yes' }), 'placement-date')
  })

  describe('when knowReleaseDate is set to no', () => {
    itShouldHaveNextValue(new ReleaseDate({ knowReleaseDate: 'no' }), 'oral-hearing')
  })

  itShouldHavePreviousValue(new ReleaseDate({}), 'release-type')

  describe('errors', () => {
    describe('if the user knows the release date', () => {
      it('should return an empty array if the date is specified', () => {
        const page = new ReleaseDate({
          knowReleaseDate: 'yes',
          'releaseDate-year': 2022,
          'releaseDate-month': 3,
          'releaseDate-day': 3,
        })
        expect(page.errors()).toEqual([])
      })

      it('should return an error if  the date is not populated', () => {
        const page = new ReleaseDate({
          knowReleaseDate: 'yes',
        })
        expect(page.errors()).toEqual([
          {
            propertyName: 'releaseDate',
            errorType: 'blank',
          },
        ])
      })

      it('should return an error if the date is invalid', () => {
        const page = new ReleaseDate({
          knowReleaseDate: 'yes',
          'releaseDate-year': 99,
          'releaseDate-month': 99,
          'releaseDate-day': 99,
        })
        expect(page.errors()).toEqual([
          {
            propertyName: 'releaseDate',
            errorType: 'invalid',
          },
        ])
      })
    })

    it('should return an empty array if the user does not know the release date', () => {
      const page = new ReleaseDate({
        knowReleaseDate: 'no',
      })
      expect(page.errors()).toEqual([])
    })

    it('should return an error if the knowReleaseDate field is not populated', () => {
      const page = new ReleaseDate({})
      expect(page.errors()).toEqual([
        {
          propertyName: 'knowReleaseDate',
          errorType: 'blank',
        },
      ])
    })
  })
})
