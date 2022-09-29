const throwMissingCypressEnvError = (field: string) => {
  throw new Error(`Missing Cypress env variable for '${field}'`)
}

export default throwMissingCypressEnvError
