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
    it('returns a filename with the current date', () => {
      const probationRegion = probationRegionFactory.build({
        name: 'Kent, Surrey & Sussex',
      })
      const month = '3'
      const year = '2023'

      const result = reportForProbationRegionFilename(probationRegion, month, year)

      expect(result).toEqual('bookings-kent-surrey-sussex-march-2023.xlsx')
    })
  })
})
