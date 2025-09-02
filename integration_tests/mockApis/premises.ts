import type { Response } from 'superagent'

import type { Premises, Cas3PremisesSummary as PremisesSummary } from '@approved-premises/api'

import { stubFor } from '.'
import {
  characteristics,
  localAuthorities,
  pdus,
  probationRegions,
} from '../../server/testutils/stubs/referenceDataStubs'
import bookingStubs from './booking'

type SearchArguments = {
  premisesSummaries: Array<PremisesSummary>
  postcode: string
}

const stubPremises = (premisesSummaries: Array<PremisesSummary>) =>
  stubFor({
    request: {
      method: 'GET',
      urlPath: '/cas3/premises/summary',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: premisesSummaries,
    },
  })

const stubPremisesSearch = (args: SearchArguments) =>
  stubFor({
    request: {
      method: 'GET',
      urlPathPattern: '/cas3/premises/summary',
      queryParameters: {
        postcodeOrAddress: {
          equalTo: args.postcode,
        },
      },
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: args.premisesSummaries,
    },
  })

const stubSinglePremises = (premises: Premises) =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/premises/${premises.id}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: premises,
    },
  })

export default {
  stubPremises,
  stubPremisesSearch,
  stubSinglePremises: (premises: Premises): Promise<[Response, Response]> =>
    Promise.all([
      stubSinglePremises(premises),
      bookingStubs.stubBookingsForPremisesId({ premisesId: premises.id, bookings: [] }),
    ]),
  stubPremisesReferenceData: (): Promise<[Response, Response, Response, Response]> =>
    Promise.all([stubFor(localAuthorities), stubFor(characteristics), stubFor(probationRegions), stubFor(pdus)]),
}
