export const throwMissingCypressEnvError = (field: string) => {
  throw new Error(`Missing Cypress env variable for '${field}'`)
}

export const getUrlEncodedCypressEnv = (field: string) => {
  const value = Cypress.env(field)
  return value && decodeURIComponent(value)
}
