import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../shared-examples'

import ReleaseDate from './releaseDate'
import applicationFactory from '../../../testutils/factories/application'
import personFactory from '../../../testutils/factories/person'

describe('ReleaseDate', () => {
  let application = applicationFactory.build()

  describe('title', () => {
    it('shold add the name of the person', () => {
      const person = personFactory.build({ name: 'John Wayne' })
      application = applicationFactory.build({ person })

      const page = new ReleaseDate({}, application, 'previousPage')

      expect(page.title).toEqual('Do you know John Wayne’s release date?')
    })
  })

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
        application,
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
    itShouldHaveNextValue(new ReleaseDate({ knowReleaseDate: 'yes' }, application, 'somePage'), 'placement-date')
  })

  describe('when knowReleaseDate is set to no', () => {
    itShouldHaveNextValue(new ReleaseDate({ knowReleaseDate: 'no' }, application, 'somePage'), 'oral-hearing')
  })

  describe("previous returns the value passed into the previousPage parameter of the object's constructor", () => {
    itShouldHavePreviousValue(new ReleaseDate({}, application, 'previousPage'), 'previousPage')
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
          application,
          'somePage',
        )
        expect(page.errors()).toEqual([])
      })

      it('should return an error if  the date is not populated', () => {
        const page = new ReleaseDate(
          {
            knowReleaseDate: 'yes',
          },
          application,
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
          application,
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
        application,
        'somePage',
      )
      expect(page.errors()).toEqual([])
    })

    it('should return an error if the knowReleaseDate field is not populated', () => {
      const page = new ReleaseDate({}, application, 'somePage')
      expect(page.errors()).toEqual([
        {
          propertyName: '$.knowReleaseDate',
          errorType: 'empty',
        },
      ])
    })
  })

  describe('response', () => {
    it('should return a translated version of the response when the user does not know the release date', () => {
      const page = new ReleaseDate(
        {
          knowReleaseDate: 'no',
        },
        application,
        'somePage',
      )

      expect(page.response()).toEqual({
        [page.title]: 'No',
      })
    })

    it('should return a translated version of the response when the user knows the release date', () => {
      const page = new ReleaseDate(
        {
          knowReleaseDate: 'yes',
          releaseDate: '2022-11-11T00:00:00.000Z',
        },
        application,
        'somePage',
      )

      expect(page.response()).toEqual({
        [page.title]: 'Yes',
        'Release Date': 'Friday 11 November 2022',
      })
    })
  })
})
