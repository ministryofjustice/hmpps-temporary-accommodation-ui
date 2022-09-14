import nock from 'nock'

import PersonClient from './personClient'
import config from '../config'
import personFactory from '../testutils/factories/person'

describe('PersonClient', () => {
  let fakeApprovedPremisesApi: nock.Scope
  let personClient: PersonClient

  const token = 'token-1'

  beforeEach(() => {
    config.apis.approvedPremises.url = 'http://localhost:8080'
    fakeApprovedPremisesApi = nock(config.apis.approvedPremises.url)
    personClient = new PersonClient(token)
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
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(201, person)

      const result = await personClient.search('crn')

      expect(result).toEqual(person)
      expect(nock.isDone()).toBeTruthy()
    })
  })
})
