import { getCombinations } from './utils'

describe('utils', () => {
  describe('getCombinations', () => {
    it('returns all the possible combinations of an array', () => {
      const arr = ['CRN', 'name', 'arrivalDate', 'expectedDepartureDate', 'keyWorker']

      expect(getCombinations(arr)).toEqual([
        ['CRN', 'name', 'arrivalDate', 'expectedDepartureDate', 'keyWorker'],
        ['CRN', 'name', 'arrivalDate', 'expectedDepartureDate'],
        ['name', 'arrivalDate', 'expectedDepartureDate', 'keyWorker'],
        ['CRN', 'name', 'arrivalDate'],
        ['name', 'arrivalDate', 'expectedDepartureDate'],
        ['arrivalDate', 'expectedDepartureDate', 'keyWorker'],
        ['CRN', 'name'],
        ['name', 'arrivalDate'],
        ['arrivalDate', 'expectedDepartureDate'],
        ['expectedDepartureDate', 'keyWorker'],
        ['CRN'],
        ['name'],
        ['arrivalDate'],
        ['expectedDepartureDate'],
        ['keyWorker'],
      ])
    })
  })
})
