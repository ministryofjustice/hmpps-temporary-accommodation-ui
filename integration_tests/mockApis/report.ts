import { Cas3ReportType } from '@approved-premises/api'
import { getMatchingRequests, stubFor } from '../../wiremock'
import { probationRegions } from '../../wiremock/referenceDataStubs'
import { getApiReportPath } from '../../server/utils/reportUtils'

export default {
  stubReportError: (args: {
    data: string
    probationRegionId: string
    startDate: string
    endDate: string
    type: Cas3ReportType
  }) =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: getApiReportPath(args.type),
        queryParameters: {
          probationRegionId: {
            equalTo: args.probationRegionId,
          },
          startDate: {
            equalTo: args.startDate,
          },
          endDate: {
            equalTo: args.endDate,
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
    startDate: string
    endDate: string
    type: Cas3ReportType
  }) =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: getApiReportPath(args.type),
        queryParameters: {
          probationRegionId: {
            equalTo: args.probationRegionId,
          },
          startDate: {
            equalTo: args.startDate,
          },
          endDate: {
            equalTo: args.endDate,
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
  verifyReportForRegion: async (args: {
    probationRegionId: string
    startDate: string
    endDate: string
    type: Cas3ReportType
  }) =>
    (
      await getMatchingRequests({
        method: 'GET',
        urlPath: getApiReportPath(args.type),
        queryParameters: {
          probationRegionId: {
            equalTo: args.probationRegionId,
          },
          startDate: {
            equalTo: args.startDate,
          },
          endDate: {
            equalTo: args.endDate,
          },
        },
      })
    ).body.requests,
  stubReportReferenceData: () => stubFor(probationRegions),
}
