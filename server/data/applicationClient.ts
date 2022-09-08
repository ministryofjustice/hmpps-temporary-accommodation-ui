/* istanbul ignore file */

import crypto from 'crypto'

import RestClient from './restClient'
import config, { ApiConfig } from '../config'

export default class ApplicationClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('applicationClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async create(): Promise<string> {
    return crypto.randomUUID()
  }
}
