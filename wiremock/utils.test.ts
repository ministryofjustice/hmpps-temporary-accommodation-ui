import { getCombinations } from './utils'

describe('utils', () => {
  describe('getCombinations', () => {
    it('returns all the possible combinations of an array', () => {
      const arr = ['crn', 'name', 'arrivalDate', 'expectedDepartureDate', 'keyWorker']

      expect(getCombinations(arr)).toEqual([
        ['crn', 'name', 'arrivalDate', 'expectedDepartureDate', 'keyWorker'],
        ['crn', 'name', 'arrivalDate', 'expectedDepartureDate'],
        ['name', 'arrivalDate', 'expectedDepartureDate', 'keyWorker'],
        ['crn', 'name', 'arrivalDate'],
        ['name', 'arrivalDate', 'expectedDepartureDate'],
        ['arrivalDate', 'expectedDepartureDate', 'keyWorker'],
        ['crn', 'name'],
        ['name', 'arrivalDate'],
        ['arrivalDate', 'expectedDepartureDate'],
        ['expectedDepartureDate', 'keyWorker'],
        ['crn'],
        ['name'],
        ['arrivalDate'],
        ['expectedDepartureDate'],
        ['keyWorker'],
      ])
    })
  })
})
