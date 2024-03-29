import nock from 'nock'

import config from '../config'
import { referenceDataFactory } from '../testutils/factories'
import ReferenceDataClient from './referenceDataClient'
import { CallConfig } from './restClient'

describe('PremisesClient', () => {
  let fakeApprovedPremisesApi: nock.Scope
  let referenceDataClient: ReferenceDataClient

  const callConfig = { token: 'some-token' } as CallConfig

  beforeEach(() => {
    config.apis.approvedPremises.url = 'http://localhost:8080'
    fakeApprovedPremisesApi = nock(config.apis.approvedPremises.url)
    referenceDataClient = new ReferenceDataClient(callConfig)
  })

  afterEach(() => {
    if (!nock.isDone()) {
      nock.cleanAll()
      throw new Error('Not all nock interceptors were used!')
    }
    nock.abortPendingRequests()
    nock.cleanAll()
  })

  describe('getReferenceData', () => {
    const referenceData = referenceDataFactory.buildList(5)

    it('should return an array of reference data', async () => {
      fakeApprovedPremisesApi
        .get('/reference-data/some-reference-data')
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200, referenceData)

      const output = await referenceDataClient.getReferenceData('some-reference-data')
      expect(output).toEqual(referenceData)
    })
  })
})
