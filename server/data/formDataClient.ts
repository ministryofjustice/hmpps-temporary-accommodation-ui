import RestClient, { CallConfig } from './restClient'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'
import { TaskData } from '@approved-premises/ui'


export default class FormDataClient {
  restClient: RestClient

  constructor(callConfig: CallConfig) {
    this.restClient = new RestClient('formClient', config.apis.approvedPremises as ApiConfig, {token:callConfig.token})
  }

  async get(id: string): Promise<TaskData> {
    return this.restClient.get<TaskData>({ path: paths.formData({ id }) })
  }

  async update(id: string, formData: TaskData): Promise<{ id: string }> {
    return this.restClient.put<{ id: string }>({
      path: paths.formData({ id }),
      data: { ...formData },
    })
  }
}