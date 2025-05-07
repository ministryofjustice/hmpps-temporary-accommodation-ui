import type {
  DateCapacity,
  NewPremises,
  TemporaryAccommodationPremises as Premises,
  Cas3PremisesSummary as PremisesSummary,
  StaffMember,
  UpdatePremises,
} from '@approved-premises/api'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'
import RestClient, { CallConfig } from './restClient'

export default class PremisesClient {
  restClient: RestClient

  constructor(callConfig: CallConfig) {
    this.restClient = new RestClient('premisesClient', config.apis.approvedPremises as ApiConfig, callConfig)
  }

  async all() {
    return this.restClient.get<Array<PremisesSummary>>({ path: paths.premises.index({}) })
  }

  async search(postcodeOrAddress: string) {
    return this.restClient.get<Array<PremisesSummary>>({
      path: paths.premises.index({}),
      query: { postcodeOrAddress },
    })
  }

  async find(id: string) {
    return this.restClient.get<Premises>({
      path: paths.premises.show({ premisesId: id }),
    })
  }

  async capacity(id: string) {
    return this.restClient.get<DateCapacity[]>({ path: paths.premises.capacity({ premisesId: id }) })
  }

  async getStaffMembers(premisesId: string) {
    return this.restClient.get<Array<StaffMember>>({
      path: paths.premises.staffMembers.index({ premisesId }),
    })
  }

  async create(data: NewPremises) {
    return this.restClient.post<Premises>({ path: paths.premises.create({}), data })
  }

  async update(id: string, data: UpdatePremises) {
    return this.restClient.put<Premises>({
      path: paths.premises.update({ premisesId: id }),
      data,
    })
  }
}
