import probationRegionFactory from '../testutils/factories/probationRegion'
import { bookingReportFilename, bookingReportForProbationRegionFilename } from './reportUtils'

describe('reportUtils', () => {
  describe('bookingReportFilename', () => {
    it('returns a filename with the current date', () => {
      jest.useFakeTimers().setSystemTime(new Date(2023, 2, 14))

      const result = bookingReportFilename()

      expect(result).toEqual('bookings-14-mar-23.xlsx')
    })
  })

  describe('bookingReportForProbationRegionFilename', () => {
    it('returns a filename with the current date', () => {
      const probationRegion = probationRegionFactory.build({
        name: 'Kent, Surrey & Sussex',
      })
      jest.useFakeTimers().setSystemTime(new Date(2023, 2, 14))

      const result = bookingReportForProbationRegionFilename(probationRegion)

      expect(result).toEqual('bookings-kent-surrey-sussex-14-mar-23.xlsx')
    })
  })
})
