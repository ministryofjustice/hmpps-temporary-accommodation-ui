import { probationRegionFactory } from '../testutils/factories'
import {
  allReportProbationRegions,
  getApiReportPath,
  reportFilename,
  reportForProbationRegionFilename,
} from './reportUtils'
import paths from '../paths/api'

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
      const startDate = '2023-06-06'
      const endDate = '2023-12-06'
      const type = 'bedUsage'

      const result = reportForProbationRegionFilename(probationRegion.name, startDate, endDate, type)

      expect(result).toEqual('bedspace-usage-kent-surrey-sussex-06-06-2023-to-06-12-2023.xlsx')
    })

    it('returns the correct filename for an occupancy report', () => {
      const probationRegion = probationRegionFactory.build({
        name: 'Kent, Surrey & Sussex',
      })
      const startDate = '2023-08-11'
      const endDate = '2023-11-23'
      const type = 'bedOccupancy'

      const result = reportForProbationRegionFilename(probationRegion.name, startDate, endDate, type)

      expect(result).toEqual('occupancy-kent-surrey-sussex-11-08-2023-to-23-11-2023.xlsx')
    })

    it('returns the correct filename for a bookings report', () => {
      const probationRegion = probationRegionFactory.build({
        name: 'Kent, Surrey & Sussex',
      })
      const startDate = '2024-01-08'
      const endDate = '2024-02-13'
      const type = 'booking'

      const result = reportForProbationRegionFilename(probationRegion.name, startDate, endDate, type)

      expect(result).toEqual('bookings-kent-surrey-sussex-08-01-2024-to-13-02-2024.xlsx')
    })

    it('returns the correct filename for a future bookings report', () => {
      const probationRegion = probationRegionFactory.build({
        name: 'Kent, Surrey & Sussex',
      })
      const startDate = '2023-08-11'
      const endDate = '2023-11-23'
      const type = 'futureBookings'

      const result = reportForProbationRegionFilename(probationRegion.name, startDate, endDate, type)

      // expect(result).toEqual('future-bookings-kent-surrey-sussex-11-08-2023-to-23-11-2023.csv')
      expect(result).toEqual('future-bookings-kent-surrey-sussex-11-08-2023-to-23-11-2023.xlsx')
    })

    it('returns the correct filename for a future bookings CSV report', () => {
      const probationRegion = probationRegionFactory.build({
        name: 'Kent, Surrey & Sussex',
      })
      const startDate = '2023-08-11'
      const endDate = '2023-11-23'
      const type = 'futureBookingsCsv'

      const result = reportForProbationRegionFilename(probationRegion.name, startDate, endDate, type)

      expect(result).toEqual('future-bookings-csv-kent-surrey-sussex-11-08-2023-to-23-11-2023.csv')
    })
  })

  describe('allReportProbationRegions', () => {
    it("returns regions for report download with 'All regions' option and 'National' filtered out", () => {
      const regionsReferenceData = [
        probationRegionFactory.build({
          name: 'region-1',
        }),
        probationRegionFactory.build({
          name: 'region-2',
        }),
        probationRegionFactory.build({
          name: 'National',
        }),
      ]

      expect(allReportProbationRegions(regionsReferenceData)).toEqual([
        {
          id: 'all',
          name: 'All regions',
        },
        regionsReferenceData[0],
        regionsReferenceData[1],
      ])
    })
  })

  describe('getApiReportPath', () => {
    it('returns booking path for booking report', () => {
      expect(getApiReportPath('booking')).toEqual(paths.reports.bookings({}))
    })

    it('returns referrals path for referrals report', () => {
      expect(getApiReportPath('referral')).toEqual(paths.reports.referrals({}))
    })

    it('returns bedspace usage path for bedspace usage report', () => {
      expect(getApiReportPath('bedUsage')).toEqual(paths.reports.bedspaceUsage({}))
    })
    it('returns future bookings path for future bookings report', () => {
      expect(getApiReportPath('futureBookings')).toEqual(paths.reports.futureBookings({}))
    })

    it('returns future bookings csv path for future bookings csv report', () => {
      expect(getApiReportPath('futureBookingsCsv')).toEqual(paths.reports.futureBookingsCsv({}))
    })
  })
})
