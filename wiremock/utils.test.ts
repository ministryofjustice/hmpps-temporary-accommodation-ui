import { getCombinations } from './utils'

describe('utils', () => {
  describe('getCombinations', () => {
    it('returns all the possible combinations of an array', () => {
      const arr = ['foo', 'bar', 'baz']

      expect(getCombinations(arr)).toEqual([
        ['foo'],
        ['foo', 'bar'],
        ['foo', 'bar', 'baz'],
        ['foo', 'baz'],
        ['foo', 'baz', 'bar'],
        ['bar'],
        ['bar', 'foo'],
        ['bar', 'foo', 'baz'],
        ['bar', 'baz'],
        ['bar', 'baz', 'foo'],
        ['baz'],
        ['baz', 'foo'],
        ['baz', 'foo', 'bar'],
        ['baz', 'bar'],
        ['baz', 'bar', 'foo'],
      ])
    })
  })
})
