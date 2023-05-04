import type {
  DateCapacity,
  NewPremises,
  TemporaryAccommodationPremises as Premises,
  TemporaryAccommodationPremisesSummary as PremisesSummary,
  StaffMember,
  UpdatePremises,
} from '@approved-premises/api'
import RestClient, { CallConfig } from './restClient'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'

export default class PremisesClient {
  restClient: RestClient

  constructor(callConfig: CallConfig) {
    this.restClient = new RestClient('premisesClient', config.apis.approvedPremises as ApiConfig, callConfig)
  }

  async all(): Promise<Array<PremisesSummary>> {
    return (await this.restClient.get({ path: paths.premises.index({}) })) as Array<PremisesSummary>
  }

  async find(id: string): Promise<Premises> {
    return (await this.restClient.get({
      path: paths.premises.show({ premisesId: id }),
    })) as Premises
  }

  async capacity(id: string): Promise<DateCapacity[]> {
    return (await this.restClient.get({ path: paths.premises.capacity({ premisesId: id }) })) as DateCapacity[]
  }

  async getStaffMembers(premisesId: string): Promise<Array<StaffMember>> {
    return (await this.restClient.get({
      path: paths.premises.staffMembers.index({ premisesId }),
    })) as StaffMember[]
  }

  async create(data: NewPremises): Promise<Premises> {
    return (await this.restClient.post({ path: paths.premises.create({}), data })) as Premises
  }

  async update(id: string, data: UpdatePremises): Promise<Premises> {
    return (await this.restClient.put({
      path: paths.premises.update({ premisesId: id }),
      data,
    })) as Premises
  }
}
