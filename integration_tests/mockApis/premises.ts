import type {
  Cas3Premises,
  Cas3PremisesBedspaceTotals,
  Cas3PremisesSearchResults,
  Cas3PremisesSortBy,
  Cas3PremisesStatus,
  Cas3ValidationResults,
} from '@approved-premises/api'
import type { Response } from 'superagent'
import { getMatchingRequests, stubFor } from './index'
import paths from '../../server/paths/api'
import {
  characteristics,
  localAuthorities,
  pdus,
  probationRegions,
} from '../../server/testutils/stubs/referenceDataStubs'
import { errorStub } from './utils'

type SearchArguments = {
  searchResults: Cas3PremisesSearchResults
  postcodeOrAddress: string
  premisesStatus: Cas3PremisesStatus
  sortBy?: Cas3PremisesSortBy
}

const stubPremisesSearch = (args: SearchArguments) =>
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

const stubSinglePremises = (premises: Cas3Premises) =>
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

const stubPremisesReferenceData = (): Promise<[Response, Response, Response, Response]> =>
  Promise.all([stubFor(localAuthorities), stubFor(characteristics), stubFor(probationRegions), stubFor(pdus)])

const stubPremisesCreate = (premises: Cas3Premises) =>
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

const stubPremisesCreateErrors = (params: Array<string>) =>
  stubFor(errorStub(params, paths.cas3.premises.create({}), 'POST'))

const verifyPremisesCreate = async () =>
  (
    await getMatchingRequests({
      method: 'POST',
      url: paths.cas3.premises.create({}),
    })
  ).body.requests

const stubPremisesUpdate = (premises: Cas3Premises) =>
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

const stubPremisesUpdateErrors = (params: { fields: Array<string>; premisesId: string }) =>
  stubFor(errorStub(params.fields, paths.cas3.premises.update({ premisesId: params.premisesId }), 'PUT'))

const verifyPremisesUpdate = async (premisesId: string) =>
  (
    await getMatchingRequests({
      method: 'PUT',
      url: paths.cas3.premises.update({ premisesId }),
    })
  ).body.requests

const stubPremisesCanArchive = (params: { premisesId: string; bedspacesReference: Cas3ValidationResults }) =>
  stubFor({
    request: {
      method: 'GET',
      url: paths.cas3.premises.canArchive({ premisesId: params.premisesId }),
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: params.bedspacesReference,
    },
  })

const stubPremisesArchive = (premises: Cas3Premises) =>
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

const verifyPremisesArchive = async (premisesId: string) =>
  (
    await getMatchingRequests({
      method: 'POST',
      url: paths.cas3.premises.archive({ premisesId }),
    })
  ).body.requests

const stubPremisesArchiveErrors = (params: { premisesId: string; endDate: string }) =>
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

const stubPremisesUnarchive = (premises: Cas3Premises) =>
  stubFor({
    request: {
      method: 'POST',
      url: paths.cas3.premises.unarchive({ premisesId: premises.id }),
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: premises,
    },
  })

const verifyPremisesUnarchive = async (premisesId: string) =>
  (
    await getMatchingRequests({
      method: 'POST',
      url: paths.cas3.premises.unarchive({ premisesId }),
    })
  ).body.requests

const stubPremisesUnarchiveErrors = (premisesId: string) =>
  stubFor({
    request: {
      method: 'POST',
      url: paths.cas3.premises.unarchive({ premisesId }),
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
            propertyName: '$.restartDate',
            errorType: 'invalidRestartDateInTheFuture',
          },
        ],
      },
    },
  })

const stubPremisesBedspaceTotals = ({
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

const stubPremisesCancelArchive = (premises: Cas3Premises) =>
  stubFor({
    request: {
      method: 'PUT',
      url: paths.cas3.premises.cancelArchive({ premisesId: premises.id }),
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: premises,
    },
  })

const verifyPremisesCancelArchive = async (premisesId: string) =>
  (
    await getMatchingRequests({
      method: 'PUT',
      url: paths.cas3.premises.cancelArchive({ premisesId }),
    })
  ).body.requests

const stubPremisesCancelArchiveErrors = (params: { premisesId: string; params: Array<string> }) =>
  stubFor({
    request: {
      method: 'PUT',
      url: paths.cas3.premises.cancelArchive({ premisesId: params.premisesId }),
    },
    response: {
      status: 400,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: {
        'invalid-params': params.params.map(errorType => ({
          propertyName: '$.premisesId',
          errorType,
        })),
      },
    },
  })

const stubPremisesCancelUnarchive = (premises: Cas3Premises) =>
  stubFor({
    request: {
      method: 'PUT',
      url: paths.cas3.premises.cancelUnarchive({ premisesId: premises.id }),
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: premises,
    },
  })

const verifyPremisesCancelUnarchive = async (premisesId: string) =>
  (
    await getMatchingRequests({
      method: 'PUT',
      url: paths.cas3.premises.cancelUnarchive({ premisesId }),
    })
  ).body.requests

const stubPremisesCancelUnarchiveErrors = (params: { premisesId: string; params: Array<string> }) =>
  stubFor({
    request: {
      method: 'PUT',
      url: paths.cas3.premises.cancelUnarchive({ premisesId: params.premisesId }),
    },
    response: {
      status: 400,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: {
        'invalid-params': params.params.map(errorType => ({
          propertyName: '$.premisesId',
          errorType,
        })),
      },
    },
  })

export default {
  stubPremisesSearch,
  stubSinglePremises,
  stubPremisesReferenceData,
  stubPremisesBedspaceTotals,
  stubPremisesCreate,
  stubPremisesCreateErrors,
  verifyPremisesCreate,
  stubPremisesUpdate,
  stubPremisesUpdateErrors,
  verifyPremisesUpdate,
  stubPremisesCanArchive,
  stubPremisesArchive,
  verifyPremisesArchive,
  stubPremisesArchiveErrors,
  stubPremisesUnarchive,
  verifyPremisesUnarchive,
  stubPremisesUnarchiveErrors,
  stubPremisesCancelArchive,
  verifyPremisesCancelArchive,
  stubPremisesCancelArchiveErrors,
  stubPremisesCancelUnarchive,
  verifyPremisesCancelUnarchive,
  stubPremisesCancelUnarchiveErrors,
}
