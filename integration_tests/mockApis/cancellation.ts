import type { SuperAgentRequest } from 'superagent'
import type { Cancellation, Cas3Cancellation } from '@approved-premises/api'

import { getMatchingRequests, stubFor } from '.'
import { errorStub } from './utils'
import { cancellationReasons } from '../../server/testutils/stubs/referenceDataStubs'
import paths from '../../server/paths/api'
import config from '../../server/config'

const cas3v2ApiEnabledStubs = {
  stubCancellationCreate: (args: {
    premisesId: string
    bookingId: string
    cancellation: Cas3Cancellation
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: paths.cas3.premises.bookings.cancellations.create({
          premisesId: args.premisesId,
          bookingId: args.bookingId,
        }),
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.cancellation,
      },
    }),
  stubCancellationCreateErrors: (args: { premisesId: string; bookingId: string; params: Array<string> }) =>
    stubFor(
      errorStub(
        args.params,
        paths.cas3.premises.bookings.cancellations.create({ premisesId: args.premisesId, bookingId: args.bookingId }),
        'POST',
      ),
    ),
  verifyCancellationCreate: async (args: { premisesId: string; bookingId: string; cancellation: Cancellation }) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: paths.cas3.premises.bookings.cancellations.create({
          premisesId: args.premisesId,
          bookingId: args.bookingId,
        }),
      })
    ).body.requests,
  stubCancellationReferenceData: () => stubFor(cancellationReasons),
}

const cas3v2ApiDisabledStubs = {
  stubCancellationCreate: (args: {
    premisesId: string
    bookingId: string
    cancellation: Cancellation
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: `/premises/${args.premisesId}/bookings/${args.bookingId}/cancellations`,
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.cancellation,
      },
    }),
  stubCancellationCreateErrors: (args: { premisesId: string; bookingId: string; params: Array<string> }) =>
    stubFor(errorStub(args.params, `/premises/${args.premisesId}/bookings/${args.bookingId}/cancellations`, 'POST')),
  verifyCancellationCreate: async (args: { premisesId: string; bookingId: string; cancellation: Cancellation }) =>
    (
      await getMatchingRequests({
        method: 'POST',
        url: `/premises/${args.premisesId}/bookings/${args.bookingId}/cancellations`,
      })
    ).body.requests,
  stubCancellationReferenceData: () => stubFor(cancellationReasons),
}

export default config.flags.enableCas3v2Api ? cas3v2ApiEnabledStubs : cas3v2ApiDisabledStubs
