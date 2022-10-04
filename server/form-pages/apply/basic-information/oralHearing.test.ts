import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../shared-examples'

import OralHearing from './oralHearing'
import applicationFactory from '../../../testutils/factories/application'
import personFactory from '../../../testutils/factories/person'

describe('OralHearing', () => {
  let application = applicationFactory.build()

  describe('title', () => {
    it('shold add the name of the person', () => {
      const person = personFactory.build({ name: 'John Wayne' })
      application = applicationFactory.build({ person })

      const page = new OralHearing({}, application)

      expect(page.title).toEqual('Do you know John Wayne’s oral hearing date?')
    })
  })

  describe('body', () => {
    it('should strip unknown attributes from the body', () => {
      const page = new OralHearing(
        {
          knowOralHearingDate: 'yes',
          'oralHearingDate-year': 2022,
          'oralHearingDate-month': 3,
          'oralHearingDate-day': 3,
          something: 'else',
        },
        application,
      )

      expect(page.body).toEqual({
        knowOralHearingDate: 'yes',
        'oralHearingDate-year': 2022,
        'oralHearingDate-month': 3,
        'oralHearingDate-day': 3,
      })
    })
  })

  itShouldHaveNextValue(new OralHearing({}, application), 'placement-date')
  itShouldHavePreviousValue(new OralHearing({}, application), 'release-date')

  describe('errors', () => {
    describe('if the user knows the oral hearing date', () => {
      it('should return an empty array if the user knows the release date and specifies the date', () => {
        const page = new OralHearing(
          {
            knowOralHearingDate: 'yes',
            'oralHearingDate-year': 2022,
            'oralHearingDate-month': 3,
            'oralHearingDate-day': 3,
          },
          application,
        )
        expect(page.errors()).toEqual([])
      })

      it('should return an error if the date is not populated', () => {
        const page = new OralHearing(
          {
            knowOralHearingDate: 'yes',
          },
          application,
        )
        expect(page.errors()).toEqual([
          {
            propertyName: '$.oralHearingDate',
            errorType: 'empty',
          },
        ])
      })

      it('should return an error if the date is invalid', () => {
        const page = new OralHearing(
          {
            knowOralHearingDate: 'yes',
            'oralHearingDate-year': 99,
            'oralHearingDate-month': 99,
            'oralHearingDate-day': 99,
          },
          application,
        )
        expect(page.errors()).toEqual([
          {
            propertyName: '$.oralHearingDate',
            errorType: 'invalid',
          },
        ])
      })
    })

    it('should return an empty array  if the user does not know the release date', () => {
      const page = new OralHearing(
        {
          knowOralHearingDate: 'no',
        },
        application,
      )
      expect(page.errors()).toEqual([])
    })

    it('should return an error if the knowOralHearingDate field is not populated', () => {
      const page = new OralHearing({}, application)
      expect(page.errors()).toEqual([
        {
          propertyName: '$.knowOralHearingDate',
          errorType: 'empty',
        },
      ])
    })
  })
})
