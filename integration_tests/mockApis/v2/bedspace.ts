import { Cas3Bedspace, Cas3Bedspaces } from '@approved-premises/api'
import { SuperAgentRequest } from 'superagent'
import { getMatchingRequests, stubFor } from '../index'
import paths from '../../../server/paths/api'

type BedspaceArguments = {
  premisesId: string
  bedspace: Cas3Bedspace
}

const stubBedspaceV2 = (args: BedspaceArguments) =>
  stubFor({
    request: {
      method: 'GET',
      urlPathPattern: paths.cas3.premises.bedspaces.show({ premisesId: args.premisesId, bedspaceId: args.bedspace.id }),
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: args.bedspace,
    },
  })

const stubPremisesBedspacesV2 = (args: { premisesId: string; bedspaces: Cas3Bedspaces }) =>
  stubFor({
    request: {
      method: 'GET',
      urlPathPattern: paths.cas3.premises.bedspaces.get({ premisesId: args.premisesId }),
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: args.bedspaces,
    },
  })

const stubBedspaceCreate: (args: { premisesId: string; bedspace: Cas3Bedspace }) => SuperAgentRequest = args =>
  stubFor({
    request: {
      method: 'POST',
      url: paths.cas3.premises.bedspaces.create({ premisesId: args.premisesId }),
    },
    response: {
      status: 201,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: args.bedspace,
    },
  })

const verifyBedspaceCreate = async (premisesId: string) => {
  const result = await getMatchingRequests({
    method: 'POST',
    url: paths.cas3.premises.bedspaces.create({ premisesId }),
  })
  return result.body.requests
}

const stubBedspaceCreateErrors = (args: {
  premisesId: string
  errors: Array<{ field: keyof Cas3Bedspace; type?: string }>
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      url: paths.cas3.premises.bedspaces.create({ premisesId: args.premisesId }),
    },
    response: {
      status: 400,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: {
        title: 'Bad Request',
        status: 400,
        detail: 'There is a problem with your request',
        'invalid-params': args.errors.map(error => ({
          propertyName: `$.${error.field}`,
          errorType: error.type || 'empty',
        })),
      },
    },
  })

const stubBedspaceArchiveV2 = (args: { premisesId: string; bedspaceId: string }) =>
  stubFor({
    request: {
      method: 'POST',
      urlPathPattern: paths.cas3.premises.bedspaces.archive({
        premisesId: args.premisesId,
        bedspaceId: args.bedspaceId,
      }),
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        id: args.bedspaceId,
        reference: 'A1',
        startDate: '2024-01-12',
        status: 'archived',
        endDate: '2025-09-25',
        notes: null,
        characteristics: [],
        bedspaceCharacteristics: null,
      },
    },
  })

const stubBedspaceArchiveV2WithError = (args: { premisesId: string; bedspaceId: string; errorType: string }) =>
  stubFor({
    request: {
      method: 'POST',
      urlPathPattern: paths.cas3.premises.bedspaces.archive({
        premisesId: args.premisesId,
        bedspaceId: args.bedspaceId,
      }),
    },
    response: {
      status: 400,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        'invalid-params': [
          {
            propertyName: '$.endDate',
            errorType: args.errorType,
            errorDetail: null,
          },
        ],
        title: 'Bad Request',
        status: 400,
        detail: 'There is a problem with your request',
      },
    },
  })

export default {
  stubBedspaceV2,
  stubPremisesBedspacesV2,
  stubBedspaceCreate,
  verifyBedspaceCreate,
  stubBedspaceCreateErrors,
  stubBedspaceArchiveV2,
  stubBedspaceArchiveV2WithError,
}
