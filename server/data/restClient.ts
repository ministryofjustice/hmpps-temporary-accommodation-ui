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
}

interface PostRequest {
  path?: string
  headers?: Record<string, string>
  responseType?: string
  data?: Record<string, unknown>
  raw?: boolean
}

type PutRequest = PostRequest

type DeleteRequest = Omit<PostRequest, 'data'>

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

type RestClientResponseGet<T> = {
  body: T
  header: Record<string, string>
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

  async get<T = unknown>(options: GetRequest): Promise<T>

  async get<T = unknown>(options: GetRequest, raw: true): Promise<RestClientResponseGet<T>>

  async get<T = unknown>(options: GetRequest, raw: boolean = false): Promise<T | RestClientResponseGet<T>> {
    logger.info(`Get using user credentials: calling ${this.name}: ${options.path} ${options.query}`)
    try {
      const result = await superagent
        .get(`${this.apiUrl()}${options.path}`)
        .agent(this.agent)
        .use(restClientMetricsMiddleware)
        .retry(2, (err, res) => {
          if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
        .query(options.query)
        .auth(this.token, { type: 'bearer' })
        .set({ ...this.defaultHeaders, ...options.headers })
        .responseType(options.responseType)
        .timeout(this.timeoutConfig())

      return raw ? (result as RestClientResponseGet<T>) : (result.body as T)
    } catch (error) {
      const sanitisedError = sanitiseError(error)
      logger.warn(
        {
          ...sanitisedError,
          query: options.query,
        },
        `Error calling ${this.name}, path: '${options.path}', verb: 'GET'`,
      )
      throw sanitisedError
    }
  }

  async post<T>(request: PostRequest = {}) {
    return this.postPutOrDelete<T>('post', request)
  }

  async put<T>(request: PutRequest = {}) {
    return this.postPutOrDelete<T>('put', request)
  }

  async delete<T>(request: DeleteRequest = {}) {
    return this.postPutOrDelete<T>('delete', request)
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

  async pipe<T = unknown>(
    response: Response,
    { path = null, headers = {}, query = '', filename = null }: PipeRequest,
  ): Promise<T> {
    logger.info(`Get using user credentials: calling ${this.name}: ${path}`)
    try {
      const result = await superagent
        .get(`${this.apiUrl()}${path}`)
        .agent(this.agent)
        .auth(this.token, { type: 'bearer' })
        .use(restClientMetricsMiddleware)
        .query(query)
        .timeout(this.timeoutConfig())
        .set({ ...this.defaultHeaders, ...headers })

      if (result.statusCode === 200) {
        response.set({
          'Content-Type': result.headers['content-type'],
          'Content-Disposition': filename
            ? `attachment; filename="${filename}"`
            : result.headers['content-disposition'],
        })
        response.send(result.body)
      }

      return result.body
    } catch (error) {
      const sanitisedError = sanitiseError(error)
      logger.warn({ ...sanitisedError }, `Error calling ${this.name}, path: '${path}'`)
      throw sanitisedError
    }
  }

  private async postPutOrDelete<T = unknown>(
    method: 'post' | 'put' | 'delete',
    { path = null, headers = {}, responseType = '', data = {}, raw = false }: PutRequest | PostRequest = {},
  ): Promise<T> {
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
