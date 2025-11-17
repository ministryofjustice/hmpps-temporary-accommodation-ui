import type {
  Cas3VoidBedspace,
  Cas3VoidBedspaceCancellation,
  Cas3VoidBedspaceRequest,
  LostBed,
  LostBedCancellation,
} from '@approved-premises/api'
import RestClient, { CallConfig } from './restClient'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'

export default class LostBedClient {
  restClient: RestClient

  constructor(callConfig: CallConfig) {
    this.restClient = new RestClient('lostBedClient', config.apis.approvedPremises as ApiConfig, callConfig)
  }

  async create(premisesId: string, bedspaceId: string, lostBed: Cas3VoidBedspaceRequest) {
    if (!config.flags.enableCas3v2Api) {
      const { reasonId, ...sharedProperties } = lostBed

      return this.restClient.post<LostBed>({
        path: paths.premises.lostBeds.create({ premisesId }),
        data: {
          ...sharedProperties,
          reason: reasonId,
          bedId: bedspaceId,
        },
      })
    }

    return this.restClient.post<Cas3VoidBedspace>({
      path: paths.cas3.premises.voidBedspaces.create({ premisesId, bedspaceId }),
      data: lostBed,
    })
  }

  async find(premisesId: string, bedspaceId: string, voidBedspaceId: string) {
    if (!config.flags.enableCas3v2Api) {
      return this.restClient.get<LostBed>({
        path: paths.premises.lostBeds.show({ premisesId, lostBedId: voidBedspaceId }),
      })
    }

    return this.restClient.get<Cas3VoidBedspace>({
      path: paths.cas3.premises.voidBedspaces.show({ premisesId, bedspaceId, voidBedspaceId }),
    })
  }

  async update(premisesId: string, bedspaceId: string, lostBedId: string, data: Cas3VoidBedspaceRequest) {
    if (!config.flags.enableCas3v2Api) {
      const { reasonId, ...sharedProperties } = data

      return this.restClient.put<LostBed>({
        path: paths.premises.lostBeds.update({ premisesId, lostBedId }),
        data: {
          ...sharedProperties,
          reason: reasonId,
          bedId: bedspaceId,
        },
      })
    }

    return this.restClient.put<Cas3VoidBedspace>({
      path: paths.cas3.premises.voidBedspaces.update({ premisesId, bedspaceId, voidBedspaceId: lostBedId }),
      data,
    })
  }

  async allLostBedsForPremisesId(premisesId: string) {
    if (!config.flags.enableCas3v2Api) {
      return this.restClient.get<Array<LostBed>>({
        path: paths.premises.lostBeds.index({ premisesId }),
      })
    }

    return this.restClient.get<Array<Cas3VoidBedspace>>({
      path: paths.cas3.premises.voidBedspaces.index({ premisesId }),
    })
  }

  async cancel(premisesId: string, bedspaceId: string, lostBedId: string, data: Cas3VoidBedspaceCancellation) {
    if (!config.flags.enableCas3v2Api) {
      return this.restClient.post<LostBedCancellation>({
        path: paths.premises.lostBeds.cancel({ premisesId, lostBedId }),
        data: {
          notes: data.cancellationNotes,
        },
      })
    }

    return this.restClient.put<Cas3VoidBedspaceCancellation>({
      path: paths.cas3.premises.voidBedspaces.cancel({ premisesId, bedspaceId, voidBedspaceId: lostBedId }),
      data,
    })
  }
}
