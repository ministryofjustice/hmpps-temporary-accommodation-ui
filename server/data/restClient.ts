/* istanbul ignore file */

import { Readable } from 'stream'
import Agent, { HttpsAgent } from 'agentkeepalive'
import superagent from 'superagent'

import { Response } from 'express'
import logger from '../../logger'
import { ProbationRegion } from '../@types/shared'
import { ApiConfig } from '../config'
import type { UnsanitisedError } from '../sanitisedError'
import sanitiseError from '../sanitisedError'
import { assertUnreachable } from '../utils/utils'
import { restClientMetricsMiddleware } from './restClientMetricsMiddleware'

interface GetRequest {
  path?: string
  query?: string | Record<string, string>
  headers?: Record<string, string>
  responseType?: string
  raw?: boolean
}

interface PostRequest {
  path?: string
  headers?: Record<string, string>
  responseType?: string
  data?: Record<string, unknown>
  raw?: boolean
}

interface PutRequest extends PostRequest {}

interface DeleteRequest extends Omit<PostRequest, 'data'> {}

interface PipeRequest {
  path?: string
  headers?: Record<string, string>
  query?: string | Record<string, string>
  filename?: string
}

interface StreamRequest {
  path?: string
  headers?: Record<string, string>
  errorLogger?: (e: UnsanitisedError) => void
}

export interface CallConfig {
  token: string
  probationRegion?: ProbationRegion
}

type RestClientResponseGet = {
  body: unknown
  header: unknown
}

export default class RestClient {
  private readonly token: string

  private readonly agent: Agent

  private readonly defaultHeaders: Record<string, string>

  constructor(
    private readonly name: string,
    private readonly config: ApiConfig,
    callConfig: CallConfig,
  ) {
    this.token = callConfig.token
    this.agent = config.url.startsWith('https') ? new HttpsAgent(config.agent) : new Agent(config.agent)
    this.defaultHeaders = {
      ...(config.serviceName ? { 'X-SERVICE-NAME': config.serviceName } : {}),
      ...(callConfig.probationRegion ? { 'X-USER-REGION': callConfig.probationRegion.id } : {}),
    }

    this.token = callConfig.token
  }

  private apiUrl() {
    return this.config.url
  }

  private timeoutConfig() {
    return this.config.timeout
  }

  async get({
    path = null,
    query = '',
    headers = {},
    responseType = '',
    raw = false,
  }: GetRequest): Promise<RestClientResponseGet | unknown> {
    logger.info(`Get using user credentials: calling ${this.name}: ${path} ${query}`)
    try {
      const result = await superagent
        .get(`${this.apiUrl()}${path}`)
        .agent(this.agent)
        .use(restClientMetricsMiddleware)
        .retry(2, (err, res) => {
          if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
        .query(query)
        .auth(this.token, { type: 'bearer' })
        .set({ ...this.defaultHeaders, ...headers })
        .responseType(responseType)
        .timeout(this.timeoutConfig())

      return raw ? result : result.body
    } catch (error) {
      const sanitisedError = sanitiseError(error)
      logger.warn({ ...sanitisedError, query }, `Error calling ${this.name}, path: '${path}', verb: 'GET'`)
      throw sanitisedError
    }
  }

  async post(request: PostRequest = {}): Promise<unknown> {
    return this.postPutOrDelete('post', request)
  }

  async put(request: PutRequest = {}): Promise<unknown> {
    return this.postPutOrDelete('put', request)
  }

  async delete(request: DeleteRequest = {}): Promise<unknown> {
    return this.postPutOrDelete('delete', request)
  }

  async stream({ path = null, headers = {} }: StreamRequest = {}): Promise<unknown> {
    logger.info(`Get using user credentials: calling ${this.name}: ${path}`)
    return new Promise((resolve, reject) => {
      superagent
        .get(`${this.apiUrl()}${path}`)
        .agent(this.agent)
        .auth(this.token, { type: 'bearer' })
        .use(restClientMetricsMiddleware)
        .retry(2, (err, res) => {
          if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
        .timeout(this.timeoutConfig())
        .set({ ...this.defaultHeaders, ...headers })
        .end((error, response) => {
          if (error) {
            logger.warn(sanitiseError(error), `Error calling ${this.name}`)
            reject(error)
          } else if (response) {
            const s = new Readable()
            // eslint-disable-next-line no-underscore-dangle,no-empty-function
            s._read = () => {}
            s.push(response.body)
            s.push(null)
            resolve(s)
          }
        })
    })
  }

  async pipe(
    response: Response,
    { path = null, headers = {}, query = '', filename = null }: PipeRequest,
  ): Promise<void> {
    logger.info(`Get using user credentials: calling ${this.name}: ${path}`)
    return new Promise((resolve, reject) => {
      superagent
        .get(`${this.apiUrl()}${path}`)
        .agent(this.agent)
        .auth(this.token, { type: 'bearer' })
        .use(restClientMetricsMiddleware)
        .retry(2, (err, _res) => {
          if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
        .query(query)
        .timeout(this.timeoutConfig())
        .set({ ...this.defaultHeaders, ...headers })
        .buffer(false)
        .parse((apiResponse, callback) => {
          // We use parse, and the response manually, rather than using Superagent's pipe method, to workaround
          // pipe ignoring errors. See https://github.com/ladjs/superagent/issues/1575
          if (apiResponse.statusCode === 200) {
            response.set({
              'Content-Type': apiResponse.headers['content-type'],
              'Content-Disposition': filename
                ? `attachment; filename="${filename}"`
                : apiResponse.headers['content-disposition'],
            })

            apiResponse.on('data', chunk => {
              response.write(chunk)
            })

            apiResponse.on('end', () => {
              response.end()
              callback(null, undefined)
              resolve()
            })
          } else {
            callback(null, undefined)
          }
        })
        .catch(err => {
          reject(err)
        })
    })
  }

  private async postPutOrDelete(
    method: 'post' | 'put' | 'delete',
    { path = null, headers = {}, responseType = '', data = {}, raw = false }: PutRequest | PostRequest = {},
  ): Promise<unknown> {
    logger.info(`${method} using user credentials: calling ${this.name}: ${path}`)
    try {
      const request = this.createRequest(method, path)

      const result = await request
        .send(this.prepareDataForTransport(data))
        .agent(this.agent)
        .use(restClientMetricsMiddleware)
        .auth(this.token, { type: 'bearer' })
        .set({ ...this.defaultHeaders, ...headers })
        .responseType(responseType)
        .timeout(this.timeoutConfig())

      return raw ? result : result.body
    } catch (error) {
      const sanitisedError = sanitiseError(error)
      logger.warn({ ...sanitisedError }, `Error calling ${this.name}, path: '${path}', verb: ${method}`)
      throw sanitisedError
    }
  }

  private createRequest(method: 'post' | 'put' | 'delete', path: string) {
    switch (method) {
      case 'post':
        return superagent.post(`${this.apiUrl()}${path}`)
      case 'put':
        return superagent.put(`${this.apiUrl()}${path}`)
      case 'delete':
        return superagent.delete(`${this.apiUrl()}${path}`)
      default:
        return assertUnreachable(method)
    }
  }

  private prepareDataForTransport(data: Record<string, unknown>): Record<string, unknown> {
    Object.keys(data).forEach(k => {
      const value = data[k]
      const valueType = typeof value

      if (valueType === 'number' && Number.isNaN(value)) {
        data[k] = 'not-a-number'
      }

      if (valueType !== 'boolean' && valueType !== 'number' && !value) {
        delete data[k]
      }
    })

    return data
  }
}
