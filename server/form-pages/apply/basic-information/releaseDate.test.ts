import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../shared-examples'

import ReleaseDate from './releaseDate'

describe('ReleaseDate', () => {
  itShouldHaveNextValue(new ReleaseDate({}), 'oral-hearing')
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
