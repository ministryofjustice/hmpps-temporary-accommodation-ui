import getDateRangesWithNegativeBeds from './premisesUtils'

describe('premisesUtils', () => {
  describe('getDateRangeWithNegativeBeds', () => {
    it('returns an empty array when passed an empty array', () => {
      const result = getDateRangesWithNegativeBeds([])
      expect(result).toEqual([])
    })
    it('returns an empty array when passed an array with no negative numbers for capacity', () => {
      const result = getDateRangesWithNegativeBeds([
        { date: new Date(2022, 0, 1).toISOString(), availableBeds: 1 },
        { date: new Date(2022, 0, 2).toISOString(), availableBeds: 2 },
        { date: new Date(2022, 0, 3).toISOString(), availableBeds: 3 },
        { date: new Date(2022, 0, 4).toISOString(), availableBeds: 0 },
      ])
      expect(result).toEqual([])
    })

    it('returns a single date if there is only one object with a negative number', () => {
      const dateCapacities = [
        { date: new Date(2022, 0, 1).toISOString(), availableBeds: -1 },
        { date: new Date(2022, 0, 2).toISOString(), availableBeds: 2 },
        { date: new Date(2022, 0, 3).toISOString(), availableBeds: 3 },
        { date: new Date(2022, 0, 4).toISOString(), availableBeds: 0 },
      ]
      const result = getDateRangesWithNegativeBeds(dateCapacities)

      expect(result).toEqual([{ start: dateCapacities[0].date }])
    })

    it('returns a single date if there is only one object with a negative number', () => {
      const dateCapacities = [
        { date: new Date(2022, 0, 1).toISOString(), availableBeds: -1 },
        { date: new Date(2022, 0, 2).toISOString(), availableBeds: 2 },
        { date: new Date(2022, 0, 3).toISOString(), availableBeds: 3 },
        { date: new Date(2022, 0, 4).toISOString(), availableBeds: 0 },
      ]
      const result = getDateRangesWithNegativeBeds(dateCapacities)

      expect(result).toEqual([{ start: dateCapacities[0].date }])
    })

    it('returns a date range if there are multiple overcapacity dates', () => {
      const dateCapacities = [
        { date: new Date(2022, 0, 1).toISOString(), availableBeds: -1 },
        { date: new Date(2022, 0, 2).toISOString(), availableBeds: -2 },
        { date: new Date(2022, 0, 3).toISOString(), availableBeds: -3 },
        { date: new Date(2022, 0, 4).toISOString(), availableBeds: 0 },
      ]
      const result = getDateRangesWithNegativeBeds(dateCapacities)

      expect(result).toEqual([{ start: dateCapacities[0].date, end: dateCapacities[2].date }])
    })

    it('returns a two date ranges if there are multiple overcapacity ranges', () => {
      const dateCapacities = [
        { date: new Date(2022, 0, 1).toISOString(), availableBeds: -1 },
        { date: new Date(2022, 0, 2).toISOString(), availableBeds: -2 },
        { date: new Date(2022, 0, 3).toISOString(), availableBeds: 3 },
        { date: new Date(2022, 0, 4).toISOString(), availableBeds: -2 },
        { date: new Date(2022, 0, 5).toISOString(), availableBeds: -2 },
      ]

      const result = getDateRangesWithNegativeBeds(dateCapacities)

      expect(result).toEqual([
        { start: dateCapacities[0].date, end: dateCapacities[1].date },
        { start: dateCapacities[3].date, end: dateCapacities[4].date },
      ])
    })
    it('returns a single date and a date range if there is both a single overcapacity days and an overcapacity range', () => {
      const dateCapacities = [
        { date: new Date(2022, 0, 1).toISOString(), availableBeds: -1 },
        { date: new Date(2022, 0, 3).toISOString(), availableBeds: 3 },
        { date: new Date(2022, 0, 4).toISOString(), availableBeds: -2 },
        { date: new Date(2022, 0, 5).toISOString(), availableBeds: -2 },
      ]

      const result = getDateRangesWithNegativeBeds(dateCapacities)

      expect(result).toEqual([
        { start: dateCapacities[0].date },
        { start: dateCapacities[2].date, end: dateCapacities[3].date },
      ])
    })
  })
})
