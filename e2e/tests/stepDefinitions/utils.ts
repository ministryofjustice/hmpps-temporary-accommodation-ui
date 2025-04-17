import { personFactory } from '../../../server/testutils/factories'

import devPersonData from '../../../cypress_shared/fixtures/person-dev.json'

export const throwMissingCypressEnvError = (field: string) => {
  throw new Error(`Missing Cypress env variable for '${field}'`)
}

export const getUrlEncodedCypressEnv = (field: string) => {
  const value = Cypress.env(field)
  return value && decodeURIComponent(value)
}

export const person = personFactory.build(devPersonData)
