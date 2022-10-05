import type { Premises, DateCapacity, StaffMember } from '@approved-premises/api'
import type { NewPremises } from '@approved-premises/ui'
import RestClient from './restClient'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'

export default class PremisesClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('premisesClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async all(): Promise<Array<Premises>> {
    return (await this.restClient.get({ path: paths.premises.index({}) })) as Array<Premises>
  }

  async find(id: string): Promise<Premises> {
    return (await this.restClient.get({ path: paths.premises.show({ premisesId: id }) })) as Premises
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
}
