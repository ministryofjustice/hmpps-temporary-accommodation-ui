import {
  Cas3NewPremises,
  Cas3Premises,
  Cas3PremisesBedspaceTotals,
  Cas3PremisesSearchResults,
  Cas3PremisesSortBy,
  Cas3PremisesStatus,
  Cas3UpdatePremises,
  Cas3ValidationResults,
} from '@approved-premises/api'
import RestClient, { CallConfig } from '../restClient'
import config, { ApiConfig } from '../../config'
import paths from '../../paths/api'

export default class PremisesClient {
  restClient: RestClient

  constructor(callConfig: CallConfig) {
    this.restClient = new RestClient('premisesClientV2', config.apis.approvedPremises as ApiConfig, callConfig)
  }

  async search(postcodeOrAddress: string, premisesStatus: Cas3PremisesStatus, sortBy: Cas3PremisesSortBy) {
    return this.restClient.get<Cas3PremisesSearchResults>({
      path: paths.cas3.premises.search({}),
      query: { postcodeOrAddress, premisesStatus, sortBy },
    })
  }

  async find(premisesId: string) {
    return this.restClient.get<Cas3Premises>({
      path: paths.cas3.premises.show({ premisesId }),
    })
  }

  async create(data: Cas3NewPremises) {
    return this.restClient.post<Cas3Premises>({ path: paths.cas3.premises.create({}), data })
  }

  async update(premisesId: string, data: Cas3UpdatePremises) {
    return this.restClient.put<Cas3Premises>({ path: paths.cas3.premises.update({ premisesId }), data })
  }

  async canArchive(premisesId: string) {
    return this.restClient.get<Cas3ValidationResults>({ path: paths.cas3.premises.canArchive({ premisesId }) })
  }

  async archive(premisesId: string, data: { endDate: string }) {
    return this.restClient.post<Cas3Premises>({ path: paths.cas3.premises.archive({ premisesId }), data })
  }

  async unarchive(premisesId: string, data: { restartDate: string }) {
    return this.restClient.post<Cas3Premises>({ path: paths.cas3.premises.unarchive({ premisesId }), data })
  }

  async cancelArchive(premisesId: string) {
    return this.restClient.put<Cas3Premises>({ path: paths.cas3.premises.cancelArchive({ premisesId }) })
  }

  async cancelUnarchive(premisesId: string) {
    return this.restClient.put<Cas3Premises>({ path: paths.cas3.premises.cancelUnarchive({ premisesId }) })
  }

  async totals(premisesId: string): Promise<Cas3PremisesBedspaceTotals> {
    return this.restClient.get<Cas3PremisesBedspaceTotals>({
      path: paths.cas3.premises.totals({ premisesId }),
    })
  }
}
