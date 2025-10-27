import { createMock } from '@golevelup/ts-jest'
import { Response } from 'express'
import paths from '../paths/api'
import { probationRegionFactory } from '../testutils/factories'
import ReportClient from './reportClient'
import { CallConfig } from './restClient'
import describeClient from '../testutils/describeClient'

describeClient('ReportClient', provider => {
  let reportClient: ReportClient
  const callConfig = { token: 'some-token' } as CallConfig

  beforeEach(() => {
    reportClient = new ReportClient(callConfig)
  })

  describe('reportForProbationRegion', () => {
    it('pipes data for a probation region to an express response', async () => {
      const probationRegion = probationRegionFactory.build()

      const data = 'some-data'
      const startDate = '2024-01-01'
      const endDate = '2024-04-01'
      const type = 'bedOccupancy'

      await provider.addInteraction({
        state: 'Bookings exist',
        uponReceiving: 'a request for bedspace utilisation report',
        withRequest: {
          method: 'GET',
          path: paths.reports.bedspaceUtilisation({}),
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
          query: { probationRegionId: probationRegion.id, startDate, endDate },
        },
        willRespondWith: {
          status: 200,
          headers: { 'content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
          body: data,
        },
      })

      const response = createMock<Response>()

      await reportClient.reportForProbationRegion(
        response,
        'some-filename',
        probationRegion.id,
        startDate,
        endDate,
        type,
      )

      expect(response.set).toHaveBeenCalledWith({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="some-filename"`,
      })
      expect(response.send).toHaveBeenCalledWith(Buffer.alloc(data.length, data))
    })
  })
})
