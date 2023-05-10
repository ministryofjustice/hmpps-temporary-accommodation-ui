import api from '../../server/paths/api'
import { getMatchingRequests, stubFor } from '../../wiremock'
import { probationRegions } from '../../wiremock/referenceDataStubs'

export default {
  stubBookingReport: (data: string) =>
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
  stubBookingReportError: (args: { data: string; probationRegionId: string; month: string; year: string }) =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: api.reports.bookings({}),
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
  stubBookingReportForRegion: (args: { data: string; probationRegionId: string; month: string; year: string }) =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: api.reports.bookings({}),
        queryParameters: {
          probationRegionId: {
            equalTo: args.probationRegionId,
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
  verifyBookingReport: async () =>
    (
      await getMatchingRequests({
        method: 'GET',
        url: api.reports.bookings({}),
      })
    ).body.requests,
  verifyBookingReportForRegion: async (args: { probationRegionId: string; month: string; year: string }) =>
    (
      await getMatchingRequests({
        method: 'GET',
        urlPath: api.reports.bookings({}),
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
  stubBookingReportReferenceData: () => stubFor(probationRegions),
}
