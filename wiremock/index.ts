import superagent, { SuperAgentRequest, Response } from 'superagent'

const wiremockEndpoint = process.env.CYPRESS ? 'http://localhost:9999' : 'http://localhost:9092'

const url = `${wiremockEndpoint}/__admin`

export const guidRegex = '([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})'

const stubFor = (mapping: Record<string, unknown>): SuperAgentRequest =>
  superagent.post(`${url}/mappings`).send(mapping)

const bulkStub = (body: Record<string, unknown>): SuperAgentRequest =>
  superagent.post(`${url}/__admin/mappings/import`).send(body)

const getMatchingRequests = (body: object) => superagent.post(`${url}/requests/find`).send(body)

const resetStubs = (): Promise<Array<Response>> =>
  Promise.all([superagent.delete(`${url}/mappings`), superagent.delete(`${url}/requests`)])

export { stubFor, getMatchingRequests, resetStubs, bulkStub }
