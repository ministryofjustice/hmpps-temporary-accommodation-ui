import nock from 'nock'

import PersonClient from './personClient'
import config from '../config'
import riskFactory from '../testutils/factories/risks'
import personFactory from '../testutils/factories/person'
import { createMockRequest } from '../testutils/createMockRequest'

describe('PersonClient', () => {
  let fakeApprovedPremisesApi: nock.Scope
  let personClient: PersonClient

  const request = createMockRequest()

  beforeEach(() => {
    config.apis.approvedPremises.url = 'http://localhost:8080'
    fakeApprovedPremisesApi = nock(config.apis.approvedPremises.url)
    personClient = new PersonClient(request)
  })

  afterEach(() => {
    if (!nock.isDone()) {
      nock.cleanAll()
      throw new Error('Not all nock interceptors were used!')
    }
    nock.abortPendingRequests()
    nock.cleanAll()
  })

  describe('search', () => {
    it('should return a person', async () => {
      const person = personFactory.build()

      fakeApprovedPremisesApi
        .get(`/people/search?crn=crn`)
        .matchHeader('authorization', `Bearer ${request.user.token}`)
        .reply(201, person)

      const result = await personClient.search('crn')

      expect(result).toEqual(person)
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('risks', () => {
    it('should return the risks for a person', async () => {
      const crn = 'crn'
      const person = riskFactory.build()

      fakeApprovedPremisesApi
        .get(`/people/${crn}/risks`)
        .matchHeader('authorization', `Bearer ${request.user.token}`)
        .reply(201, person)

      const result = await personClient.risks(crn)

      expect(result).toEqual(person)
      expect(nock.isDone()).toBeTruthy()
    })
  })
})
