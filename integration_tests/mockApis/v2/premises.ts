import type {
  Cas3Premises,
  Cas3PremisesBedspaceTotals,
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

const stubPremisesUpdateV2 = (premises: Cas3Premises) =>
  stubFor({
    request: {
      method: 'PUT',
      url: paths.cas3.premises.update({ premisesId: premises.id }),
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: premises,
    },
  })

const stubPremisesUpdateErrorsV2 = (params: { fields: Array<string>; premisesId: string }) =>
  stubFor(errorStub(params.fields, paths.cas3.premises.update({ premisesId: params.premisesId }), 'PUT'))

const verifyPremisesUpdateV2 = async (premisesId: string) =>
  (
    await getMatchingRequests({
      method: 'PUT',
      url: paths.cas3.premises.update({ premisesId }),
    })
  ).body.requests

const stubPremisesArchiveV2 = (premises: Cas3Premises) =>
  stubFor({
    request: {
      method: 'POST',
      url: paths.cas3.premises.archive({ premisesId: premises.id }),
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: premises,
    },
  })

const verifyPremisesArchiveV2 = async (premisesId: string) =>
  (
    await getMatchingRequests({
      method: 'POST',
      url: paths.cas3.premises.archive({ premisesId }),
    })
  ).body.requests

const stubPremisesArchiveErrorsV2 = (params: { premisesId: string; endDate: string }) =>
  stubFor({
    request: {
      method: 'POST',
      url: paths.cas3.premises.archive({ premisesId: params.premisesId }),
    },
    response: {
      status: 400,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: {
        type: 'https://example.net/validation-error',
        title: 'Invalid request parameters',
        code: 400,
        'invalid-params': [
          {
            propertyName: '$.endDate',
            errorType: 'existingUpcomingBedspace',
            value: params.endDate,
          },
        ],
      },
    },
  })

const stubPremisesBedspaceTotalsV2 = ({
  premisesId,
  totals,
}: {
  premisesId: string
  totals: Cas3PremisesBedspaceTotals
}) =>
  stubFor({
    request: {
      method: 'GET',
      urlPathPattern: paths.cas3.premises.totals({ premisesId }),
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: totals,
    },
  })

export default {
  stubPremisesSearchV2,
  stubSinglePremisesV2,
  stubPremisesReferenceDataV2,
  stubPremisesBedspaceTotalsV2,
  stubPremisesCreateV2,
  stubPremisesCreateErrorsV2,
  verifyPremisesCreateV2,
  stubPremisesUpdateV2,
  stubPremisesUpdateErrorsV2,
  verifyPremisesUpdateV2,
  stubPremisesArchiveV2,
  verifyPremisesArchiveV2,
  stubPremisesArchiveErrorsV2,
}
