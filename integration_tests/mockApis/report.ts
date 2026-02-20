import { Cas3ReportType } from '@approved-premises/api'
import { getMatchingRequests, stubFor } from '.'
import { probationRegions } from '../../server/testutils/stubs/referenceDataStubs'
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
  stubGapReportError: (args: {
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
          probationRegionId: { equalTo: args.probationRegionId },
          startDate: { equalTo: args.startDate },
          endDate: { equalTo: args.endDate },
        },
      },
      response: {
        status: 400,
        headers: {
          'Content-Type': 'application/problem+json;charset=UTF-8',
        },
        jsonBody: {
          title: 'Bad Request',
          status: 400,
          detail: 'There is a problem with your request',
          'invalid-params': [
            {
              propertyName: '$.endDate',
              errorType: 'rangeTooLarge',
            },
          ],
        },
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
