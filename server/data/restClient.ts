/* istanbul ignore file */

import superagent from 'superagent'
import Agent, { HttpsAgent } from 'agentkeepalive'
import { Readable } from 'stream'

import { Response } from 'express'
import logger from '../../logger'
import sanitiseError from '../sanitisedError'
import { ApiConfig } from '../config'
import type { UnsanitisedError } from '../sanitisedError'
import { restClientMetricsMiddleware } from './restClientMetricsMiddleware'
import { ProbationRegion } from '../@types/shared'

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

interface StreamRequest {
  path?: string
  headers?: Record<string, string>
  errorLogger?: (e: UnsanitisedError) => void
}

export interface CallConfig {
  token: string
  probationRegion?: ProbationRegion
}

export default class RestClient {
  private readonly token: string

  private readonly agent: Agent

  private readonly defaultHeaders: Record<string, string>

  constructor(private readonly name: string, private readonly config: ApiConfig, callConfig: CallConfig) {
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

  async get({ path = null, query = '', headers = {}, responseType = '', raw = false }: GetRequest): Promise<unknown> {
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
    return this.postOrPut('post', request)
  }

  async put(request: PutRequest = {}): Promise<unknown> {
    return this.postOrPut('put', request)
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
            // eslint-disable-next-line no-underscore-dangle,@typescript-eslint/no-empty-function
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
    filename: string,
    { path = null, headers = {} }: GetRequest = {},
    query: Record<string, string> | string = '',
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
              'Content-Disposition': `attachment; filename="${filename}"`,
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

  private async postOrPut(
    method: 'post' | 'put',
    { path = null, headers = {}, responseType = '', data = {}, raw = false }: PutRequest | PostRequest = {},
  ): Promise<unknown> {
    logger.info(`${method} using user credentials: calling ${this.name}: ${path}`)
    try {
      const request =
        method === 'post' ? superagent.post(`${this.apiUrl()}${path}`) : superagent.put(`${this.apiUrl()}${path}`)

      const result = await request
        .send(this.filterBlanksFromData(data))
        .agent(this.agent)
        .use(restClientMetricsMiddleware)
        .retry(2, (err, res) => {
          if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
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

  private filterBlanksFromData(data: Record<string, unknown>): Record<string, unknown> {
    Object.keys(data).forEach(k => typeof data[k] !== 'boolean' && !data[k] && delete data[k])

    return data
  }
}
