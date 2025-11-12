import type { SuperAgentRequest } from 'superagent'
import type { Cas3Confirmation, Confirmation } from '@approved-premises/api'

import { getMatchingRequests, stubFor } from '.'
import paths from '../../server/paths/api'
import config from '../../server/config'

const cas3v2ApiEnabledStubs = {
  stubConfirmationCreate: (args: {
    premisesId: string
    bookingId: string
    confirmation: Cas3Confirmation
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: paths.cas3.premises.bookings.confirmations({ premisesId: args.premisesId, bookingId: args.bookingId }),
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.confirmation,
      },
    }),
  verifyConfirmationCreate: async (args: { premisesId: string; bookingId: string }) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: paths.cas3.premises.bookings.confirmations({ premisesId: args.premisesId, bookingId: args.bookingId }),
      })
    ).body.requests,
}

const cas3v2ApiDisabledStubs = {
  stubConfirmationCreate: (args: {
    premisesId: string
    bookingId: string
    confirmation: Confirmation
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: `/premises/${args.premisesId}/bookings/${args.bookingId}/confirmations`,
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.confirmation,
      },
    }),
  verifyConfirmationCreate: async (args: { premisesId: string; bookingId: string }) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: `/premises/${args.premisesId}/bookings/${args.bookingId}/confirmations`,
      })
    ).body.requests,
}

export default config.flags.enableCas3v2Api ? cas3v2ApiEnabledStubs : cas3v2ApiDisabledStubs
