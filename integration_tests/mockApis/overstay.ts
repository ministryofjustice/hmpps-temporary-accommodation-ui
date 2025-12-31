import { SuperAgentRequest } from 'superagent'

import { NewOverstay, Overstay } from '../../server/data/bookingClient'
import { getMatchingRequests, stubFor } from '.'
import paths from '../../server/paths/api'
import config from '../../server/config'

const cas3v2ApiEnabledStubs = {
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

  verifyOverstayCreate: async (args: { premisesId: string; bookingId: string }) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: paths.cas3.premises.bookings.overstays({ premisesId: args.premisesId, bookingId: args.bookingId }),
      })
    ).body.requests,
}

const cas3v2ApiDisabledStubs = {
  stubOverstayCreate: (args: { premisesId: string; bookingId: string; overstay: Overstay }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: paths.premises.bookings.overstays({ premisesId: args.premisesId, bookingId: args.bookingId }),
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.overstay,
      },
    }),

  verifyOverstayCreate: async (args: { premisesId: string; bookingId: string }) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: `/premises/${args.premisesId}/bookings/${args.bookingId}/overstays`,
      })
    ).body.requests,
}

export default config.flags.enableCas3v2Api ? cas3v2ApiEnabledStubs : cas3v2ApiDisabledStubs
