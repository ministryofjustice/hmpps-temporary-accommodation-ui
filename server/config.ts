/* istanbul ignore file */

import { ServiceName } from '@approved-premises/api'
import 'dotenv/config'

const production = process.env.NODE_ENV === 'production'

function get<T>(name: string, fallback: T, options = { requireInProduction: false }): T | string {
  if (process.env[name]) {
    return process.env[name]
  }
  if (fallback !== undefined && (!production || !options.requireInProduction)) {
    return fallback
  }
  throw new Error(`Missing env var ${name}`)
}

const requiredInProduction = { requireInProduction: true }

export class AgentConfig {
  timeout: number

  constructor(timeout = 8000) {
    this.timeout = timeout
  }
}

export interface ApiConfig {
  url: string
  timeout: {
    response: number
    deadline: number
  }
  agent: AgentConfig
  serviceName?: ServiceName
}

export interface AuditConfig {
  region: string
  accessKeyId: string
  secretAccessKey: string
  queueUrl: string
  serviceName: string
  logErrors: boolean
}

const environment = process.env.ENVIRONMENT || 'local'

export default {
  https: production,
  staticResourceCacheDuration: 20,
  flags: {
    oasysDisabled: process.env.OASYS_DISABLED || false,
    voidsDisabled: !['local', 'dev', 'test'].includes(environment),
    applyDisabled: !['local', 'dev', 'test'].includes(environment),
  },
  environment,
  sentry: {
    dsn: get('SENTRY_DSN', null, requiredInProduction),
  },
  redis: {
    host: get('REDIS_HOST', 'localhost', requiredInProduction),
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_AUTH_TOKEN,
    tls_enabled: get('REDIS_TLS_ENABLED', 'false'),
  },
  session: {
    secret: get('SESSION_SECRET', 'app-insecure-default-session', requiredInProduction),
    expiryMinutes: Number(get('WEB_SESSION_TIMEOUT_IN_MINUTES', 120)),
  },
  apis: {
    hmppsAuth: {
      url: get('HMPPS_AUTH_URL', 'http://localhost:9090/auth', requiredInProduction),
      externalUrl: get('HMPPS_AUTH_EXTERNAL_URL', get('HMPPS_AUTH_URL', 'http://localhost:9090/auth')),
      timeout: {
        response: Number(get('HMPPS_AUTH_TIMEOUT_RESPONSE', 10000)),
        deadline: Number(get('HMPPS_AUTH_TIMEOUT_DEADLINE', 10000)),
      },
      agent: new AgentConfig(Number(get('HMPPS_AUTH_TIMEOUT_RESPONSE', 10000))),
      apiClientId: get('API_CLIENT_ID', 'clientid', requiredInProduction),
      apiClientSecret: get('API_CLIENT_SECRET', 'clientsecret', requiredInProduction),
      systemClientId: get('SYSTEM_CLIENT_ID', 'clientid', requiredInProduction),
      systemClientSecret: get('SYSTEM_CLIENT_SECRET', 'clientsecret', requiredInProduction),
    },
    tokenVerification: {
      url: get('TOKEN_VERIFICATION_API_URL', 'http://localhost:8100', requiredInProduction),
      timeout: {
        response: Number(get('TOKEN_VERIFICATION_API_TIMEOUT_RESPONSE', 5000)),
        deadline: Number(get('TOKEN_VERIFICATION_API_TIMEOUT_DEADLINE', 5000)),
      },
      agent: new AgentConfig(Number(get('TOKEN_VERIFICATION_API_TIMEOUT_RESPONSE', 5000))),
      enabled: get('TOKEN_VERIFICATION_ENABLED', 'false') === 'true',
    },
    approvedPremises: {
      url: get('APPROVED_PREMISES_API_URL', 'http://localhost:9092', requiredInProduction),
      timeout: {
        response: environment === 'dev' ? 30000 : 10000,
        deadline: environment === 'dev' ? 30000 : 10000,
      },
      agent: new AgentConfig(10000),
      serviceName: 'temporary-accommodation',
    },
    audit: {
      region: get('AUDIT_SQS_REGION', 'eu-west-2'),
      accessKeyId: get('AUDIT_SQS_ACCESS_KEY_ID', ''),
      secretAccessKey: get('AUDIT_SQS_SECRET_ACCESS_KEY', ''),
      queueUrl: get('AUDIT_SQS_QUEUE_URL', ''),
      serviceName: get('AUDIT_SERVICE_NAME', 'hmpps-temporary-accommodation-ui'),
      logErrors: get('AUDIT_LOG_ERRORS', 'false') === 'true',
    },
  },
  domain: get('INGRESS_URL', 'http://localhost:3000', requiredInProduction),
}
