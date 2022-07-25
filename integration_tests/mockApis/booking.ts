import type { Booking } from 'approved-premises'

import { getMatchingRequests, stubFor } from '../../wiremock'

export default {
  stubBookingCreate: (args: { premisesId: string; booking: Booking }) =>
    stubFor({
      request: {
        method: 'POST',
        url: `/premises/${args.premisesId}/booking/new`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: args.booking,
      },
    }),
  verifyBookingCreate: async (args: { premisesId }) =>
    (await getMatchingRequests({ method: 'POST', url: `/premises/${args.premisesId}/booking/new` })).body.requests,
}
