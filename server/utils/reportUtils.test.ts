import { probationRegionFactory } from '../testutils/factories'
import { bookingReportFilename, bookingReportForProbationRegionFilename } from './reportUtils'

jest.mock('./validation')

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
      const month = '3'
      const year = '2023'

      const result = bookingReportForProbationRegionFilename(probationRegion, month, year)

      expect(result).toEqual('bookings-kent-surrey-sussex-march-2023.xlsx')
    })
  })
})
