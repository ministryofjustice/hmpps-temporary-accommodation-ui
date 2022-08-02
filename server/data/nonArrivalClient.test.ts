import nock from 'nock'

import NonArrivalClient from './nonArrivalClient'
import config from '../config'
import nonArrivalFactory from '../testutils/factories/nonArrival'

describe('NonArrivalClient', () => {
  let fakeApprovedPremisesApi: nock.Scope
  let nonArrivalClient: NonArrivalClient

  const token = 'token-1'

  beforeEach(() => {
    config.apis.approvedPremises.url = 'http://localhost:8080'
    fakeApprovedPremisesApi = nock(config.apis.approvedPremises.url)
    nonArrivalClient = new NonArrivalClient(token)
  })

  afterEach(() => {
    if (!nock.isDone()) {
      nock.cleanAll()
      throw new Error('Not all nock interceptors were used!')
    }
    nock.abortPendingRequests()
    nock.cleanAll()
  })

  describe('create', () => {
    it('should create an non-arrival', async () => {
      const nonArrival = nonArrivalFactory.build()
      const payload = {
        date: nonArrival.date.toString(),
        notes: nonArrival.notes,
        reason: nonArrival.reason,
      }

      fakeApprovedPremisesApi
        .post(`/premises/premisesId/bookings/bookingId/non-arrivals`, payload)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(201, nonArrival)

      const result = await nonArrivalClient.create('premisesId', 'bookingId', payload)

      expect(result).toEqual(nonArrival)
      expect(nock.isDone()).toBeTruthy()
    })
  })
})
