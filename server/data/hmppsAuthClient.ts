import { URLSearchParams } from 'url'
import superagent from 'superagent'

import logger from '../../logger'
import generateOauthClientToken from '../authentication/clientCredentials'
import config from '../config'
import RestClient, { CallConfig } from './restClient'
import type TokenStore from './tokenStore'

const timeoutSpec = config.apis.hmppsAuth.timeout
const hmppsAuthUrl = config.apis.hmppsAuth.url

function getSystemClientTokenFromHmppsAuth(username?: string): Promise<superagent.Response> {
  const clientToken = generateOauthClientToken(
    config.apis.hmppsAuth.systemClientId,
    config.apis.hmppsAuth.systemClientSecret,
  )

  const grantRequest = new URLSearchParams({
    grant_type: 'client_credentials',
    ...(username && { username }),
  }).toString()

  logger.info(`${grantRequest} HMPPS Auth request for client id '${config.apis.hmppsAuth.systemClientId}''`)

  return superagent
    .post(`${hmppsAuthUrl}/oauth/token`)
    .set('Authorization', clientToken)
    .set('content-type', 'application/x-www-form-urlencoded')
    .send(grantRequest)
    .timeout(timeoutSpec)
}

export interface User {
  name: string
  activeCaseLoadId: string
}

export interface UserRole {
  roleCode: string
}

export default class HmppsAuthClient {
  constructor(private readonly tokenStore: TokenStore) {}

  private static restClient(callConfig: CallConfig): RestClient {
    return new RestClient('HMPPS Auth Client', config.apis.hmppsAuth, callConfig)
  }

  getActingUser(callConfig: CallConfig): Promise<User> {
    logger.info(`Getting user details: calling HMPPS Auth`)
    return HmppsAuthClient.restClient(callConfig).get({ path: '/api/user/me' }) as Promise<User>
  }

  getUserRoles(callConfig: CallConfig): Promise<string[]> {
    return HmppsAuthClient.restClient(callConfig)
      .get({ path: '/api/user/me/roles' })
      .then(roles => (<UserRole[]>roles).map(role => role.roleCode))
  }

  async getSystemClientToken(username?: string): Promise<string> {
    const key = username || '%ANONYMOUS%'

    const token = await this.tokenStore.getToken(key)
    if (token) {
      return token
    }

    const newToken = await getSystemClientTokenFromHmppsAuth(username)

    // set TTL slightly less than expiry of token. Async but no need to wait
    await this.tokenStore.setToken(key, newToken.body.access_token, newToken.body.expires_in - 60)

    return newToken.body.access_token
  }
}
