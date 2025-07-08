import type {
  Cas3Premises,
  Cas3PremisesSearchResults,
  Cas3PremisesSortBy,
  Cas3PremisesStatus,
} from '@approved-premises/api'
import type { Response } from 'superagent'
import { stubFor } from '..'
import paths from '../../../server/paths/api'
import {
  characteristics,
  localAuthorities,
  pdus,
  probationRegions,
} from '../../../server/testutils/stubs/referenceDataStubs'

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

export default {
  stubPremisesSearchV2,
  stubSinglePremisesV2,
  stubPremisesReferenceDataV2,
}
