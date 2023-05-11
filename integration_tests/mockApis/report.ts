import { ReportType } from '@approved-premises/ui'
import api from '../../server/paths/api'
import { getMatchingRequests, stubFor } from '../../wiremock'
import { probationRegions } from '../../wiremock/referenceDataStubs'
import { getApiReportPath } from '../../server/utils/reportUtils'

export default {
  stubReport: (data: string) =>
    stubFor({
      request: {
        method: 'GET',
        url: api.reports.bookings({}),
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
        },
        body: data,
      },
    }),
  stubReportError: (args: { data: string; probationRegionId: string; month: string; year: string; type: ReportType }) =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: getApiReportPath(args.type),
        queryParameters: {
          probationRegionId: {
            equalTo: args.probationRegionId,
          },
          month: {
            equalTo: args.month,
          },
          year: {
            equalTo: args.year,
          },
        },
      },
      response: {
        status: 500,
        body: args.data,
      },
    }),
  stubReportForRegion: (args: {
    data: string
    probationRegionId: string
    month: string
    year: string
    type: ReportType
  }) =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: getApiReportPath(args.type),
        queryParameters: {
          probationRegionId: {
            equalTo: args.probationRegionId,
          },
          month: {
            equalTo: args.month,
          },
          year: {
            equalTo: args.year,
          },
        },
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
        },
        body: args.data,
      },
    }),
  verifyReport: async () =>
    (
      await getMatchingRequests({
        method: 'GET',
        url: api.reports.bookings({}),
      })
    ).body.requests,
  verifyReportForRegion: async (args: { probationRegionId: string; month: string; year: string; type: ReportType }) =>
    (
      await getMatchingRequests({
        method: 'GET',
        urlPath: getApiReportPath(args.type),
        queryParameters: {
          probationRegionId: {
            equalTo: args.probationRegionId,
          },
          month: {
            equalTo: args.month,
          },
          year: {
            equalTo: args.year,
          },
        },
      })
    ).body.requests,
  stubReportReferenceData: () => stubFor(probationRegions),
}
