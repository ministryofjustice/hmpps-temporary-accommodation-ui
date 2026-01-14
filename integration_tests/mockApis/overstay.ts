import { SuperAgentRequest } from 'superagent'

import { Cas3Overstay, NewOverstay } from '@approved-premises/api'
import { getMatchingRequests, stubFor } from '.'
import paths from '../../server/paths/api'
import { bedspaceConflictResponseBody } from './utils'

export default {
  stubOverstayCreate: (args: { premisesId: string; bookingId: string; overstay: NewOverstay }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: paths.cas3.premises.bookings.overstays({ premisesId: args.premisesId, bookingId: args.bookingId }),
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.overstay,
      },
    }),

  stubOverstayCreateConflictError: (args: {
    premisesId: string
    bookingId: string
    conflictingBookingId: string
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: paths.cas3.premises.bookings.overstays({ premisesId: args.premisesId, bookingId: args.bookingId }),
      },
      response: {
        status: 409,
        headers: {
          'Content-Type': 'application/problem+json;charset=UTF-8',
        },
        jsonBody: bedspaceConflictResponseBody(args.conflictingBookingId, 'booking'),
      },
    }),

  verifyOverstayCreate: async (args: { premisesId: string; bookingId: string }) => {
    const result = await getMatchingRequests({
      method: 'POST',
      url: paths.cas3.premises.bookings.overstays({ premisesId: args.premisesId, bookingId: args.bookingId }),
    })
    return result.body.requests
  },
}
