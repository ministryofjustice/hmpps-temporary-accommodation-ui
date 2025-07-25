import type {
  Cas3Premises,
  Cas3PremisesSearchResults,
  Cas3PremisesSortBy,
  Cas3PremisesStatus,
} from '@approved-premises/api'
import type { Response } from 'superagent'
import { getMatchingRequests, stubFor } from '..'
import paths from '../../../server/paths/api'
import {
  characteristics,
  localAuthorities,
  pdus,
  probationRegions,
} from '../../../server/testutils/stubs/referenceDataStubs'
import { errorStub } from '../utils'

type SearchArguments = {
  searchResults: Cas3PremisesSearchResults
  postcodeOrAddress: string
  premisesStatus: Cas3PremisesStatus
  sortBy?: Cas3PremisesSortBy
}

const stubPremisesSearchV2 = (args: SearchArguments) =>
  stubFor({
    request: {
      method: 'GET',
      urlPathPattern: paths.cas3.premises.search({}),
      queryParameters: {
        postcodeOrAddress: { equalTo: args.postcodeOrAddress },
        premisesStatus: { equalTo: args.premisesStatus },
        sortBy: { equalTo: args.sortBy ?? 'pdu' },
      },
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: args.searchResults,
    },
  })

const stubSinglePremisesV2 = (premises: Cas3Premises) =>
  stubFor({
    request: {
      method: 'GET',
      urlPathPattern: paths.cas3.premises.show({ premisesId: premises.id }),
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: premises,
    },
  })

const stubPremisesReferenceDataV2 = (): Promise<[Response, Response, Response, Response]> =>
  Promise.all([stubFor(localAuthorities), stubFor(characteristics), stubFor(probationRegions), stubFor(pdus)])

const stubPremisesCreateV2 = (premises: Cas3Premises) =>
  stubFor({
    request: {
      method: 'POST',
      url: paths.cas3.premises.create({}),
    },
    response: {
      status: 201,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: premises,
    },
  })

const stubPremisesCreateErrorsV2 = (params: Array<string>) =>
  stubFor(errorStub(params, paths.cas3.premises.create({}), 'POST'))

const verifyPremisesCreateV2 = async () =>
  (
    await getMatchingRequests({
      method: 'POST',
      url: paths.cas3.premises.create({}),
    })
  ).body.requests

export default {
  stubPremisesSearchV2,
  stubSinglePremisesV2,
  stubPremisesReferenceDataV2,
  stubPremisesCreateV2,
  stubPremisesCreateErrorsV2,
  verifyPremisesCreateV2,
}
