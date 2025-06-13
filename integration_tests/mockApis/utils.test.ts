import { getCombinations } from './utils'

describe('utils', () => {
  describe('getCombinations', () => {
    it('returns all the possible combinations of an array', () => {
      const arr = ['crn', 'name', 'expectedArrivalDate', 'expectedDepartureDate', 'keyWorkerId']

      expect(getCombinations(arr)).toEqual([
        ['crn', 'name', 'expectedArrivalDate', 'expectedDepartureDate', 'keyWorkerId'],
        ['crn', 'name', 'expectedArrivalDate', 'expectedDepartureDate'],
        ['name', 'expectedArrivalDate', 'expectedDepartureDate', 'keyWorkerId'],
        ['crn', 'name', 'expectedArrivalDate'],
        ['name', 'expectedArrivalDate', 'expectedDepartureDate'],
        ['expectedArrivalDate', 'expectedDepartureDate', 'keyWorkerId'],
        ['crn', 'name'],
        ['name', 'expectedArrivalDate'],
        ['expectedArrivalDate', 'expectedDepartureDate'],
        ['expectedDepartureDate', 'keyWorkerId'],
        ['crn'],
        ['name'],
        ['expectedArrivalDate'],
        ['expectedDepartureDate'],
        ['keyWorkerId'],
      ])
    })
  })
})
