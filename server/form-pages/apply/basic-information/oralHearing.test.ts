import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../shared-examples'

import OralHearing from './oralHearing'

describe('OralHearing', () => {
  describe('body', () => {
    it('should strip unknown attributes from the body', () => {
      const page = new OralHearing({
        knowOralHearingDate: 'yes',
        'oralHearingDate-year': 2022,
        'oralHearingDate-month': 3,
        'oralHearingDate-day': 3,
        something: 'else',
      })

      expect(page.body).toEqual({
        knowOralHearingDate: 'yes',
        'oralHearingDate-year': 2022,
        'oralHearingDate-month': 3,
        'oralHearingDate-day': 3,
      })
    })
  })

  itShouldHaveNextValue(new OralHearing({}), 'placement-date')
  itShouldHavePreviousValue(new OralHearing({}), 'release-date')

  describe('errors', () => {
    describe('if the user knows the oral hearing date', () => {
      it('should return an empty array if the user knows the release date and specifies the date', () => {
        const page = new OralHearing({
          knowOralHearingDate: 'yes',
          'oralHearingDate-year': 2022,
          'oralHearingDate-month': 3,
          'oralHearingDate-day': 3,
        })
        expect(page.errors()).toEqual([])
      })

      it('should return an error if the date is not populated', () => {
        const page = new OralHearing({
          knowOralHearingDate: 'yes',
        })
        expect(page.errors()).toEqual([
          {
            propertyName: 'oralHearingDate',
            errorType: 'blank',
          },
        ])
      })

      it('should return an error if the date is invalid', () => {
        const page = new OralHearing({
          knowOralHearingDate: 'yes',
          'oralHearingDate-year': 99,
          'oralHearingDate-month': 99,
          'oralHearingDate-day': 99,
        })
        expect(page.errors()).toEqual([
          {
            propertyName: 'oralHearingDate',
            errorType: 'invalid',
          },
        ])
      })
    })

    it('should return an empty array  if the user does not know the release date', () => {
      const page = new OralHearing({
        knowOralHearingDate: 'no',
      })
      expect(page.errors()).toEqual([])
    })

    it('should return an error if the knowOralHearingDate field is not populated', () => {
      const page = new OralHearing({})
      expect(page.errors()).toEqual([
        {
          propertyName: 'knowOralHearingDate',
          errorType: 'blank',
        },
      ])
    })
  })
})
