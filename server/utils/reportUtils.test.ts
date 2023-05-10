import { probationRegionFactory } from '../testutils/factories'
import { reportFilename, reportForProbationRegionFilename } from './reportUtils'

jest.mock('./validation')

describe('reportUtils', () => {
  describe('reportFilename', () => {
    it('returns a filename with the current date', () => {
      jest.useFakeTimers().setSystemTime(new Date(2023, 2, 14))

      const result = reportFilename()

      expect(result).toEqual('bookings-14-mar-23.xlsx')
    })
  })

  describe('reportForProbationRegionFilename', () => {
    it('returns the correct filename for a bedspace usage report', () => {
      const probationRegion = probationRegionFactory.build({
        name: 'Kent, Surrey & Sussex',
      })
      const month = '3'
      const year = '2023'
      const type = 'bedspace-usage'

      const result = reportForProbationRegionFilename(probationRegion, month, year, type)

      expect(result).toEqual('bedspace-usage-kent-surrey-sussex-march-2023.xlsx')
    })

    it('returns the correct filename for an occupancy report', () => {
      const probationRegion = probationRegionFactory.build({
        name: 'Kent, Surrey & Sussex',
      })
      const month = '6'
      const year = '2024'
      const type = 'occupancy'

      const result = reportForProbationRegionFilename(probationRegion, month, year, type)

      expect(result).toEqual('occupancy-kent-surrey-sussex-june-2024.xlsx')
    })

    it('returns the correct filename for a bookings report', () => {
      const probationRegion = probationRegionFactory.build({
        name: 'Kent, Surrey & Sussex',
      })
      const month = '1'
      const year = '2023'
      const type = 'bookings'

      const result = reportForProbationRegionFilename(probationRegion, month, year, type)

      expect(result).toEqual('bookings-kent-surrey-sussex-january-2023.xlsx')
    })
  })
})
