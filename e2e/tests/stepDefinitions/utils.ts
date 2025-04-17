import { personFactory } from '../../../server/testutils/factories'

import devPersonData from '../../../cypress_shared/fixtures/person-dev.json'
import localPersonData from '../../../cypress_shared/fixtures/person-local.json'

export const throwMissingCypressEnvError = (field: string) => {
  throw new Error(`Missing Cypress env variable for '${field}'`)
}

export const getUrlEncodedCypressEnv = (field: string) => {
  const value = Cypress.env(field)
  return value && decodeURIComponent(value)
}

export const environment = Cypress.env('environment') || throwMissingCypressEnvError('environment')

export const person = personFactory.build(environment === 'local' ? localPersonData : devPersonData)
