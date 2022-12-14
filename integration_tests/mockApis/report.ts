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
  stubBookingReportError: (data: string) =>
    stubFor({
      request: {
        method: 'GET',
        url: api.reports.bookings({}),
      },
      response: {
        status: 500,
        body: data,
      },
    }),
  stubBookingReportForRegion: (args: { data: string; probationRegionId: string }) =>
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
  verifyBookingReportForRegion: async (probationRegionId: string) =>
    (
      await getMatchingRequests({
        method: 'GET',
        urlPath: api.reports.bookings({}),
        queryParameters: {
          probationRegionId: {
            equalTo: probationRegionId,
          },
        },
      })
    ).body.requests,
  stubBookingReportReferenceData: () => stubFor(probationRegions),
}
