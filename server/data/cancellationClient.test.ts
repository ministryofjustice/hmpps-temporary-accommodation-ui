import nock from 'nock'

import CancellationClient from './cancellationClient'
import config from '../config'
import cancellationFactory from '../testutils/factories/cancellation'
import newCancellationFactory from '../testutils/factories/newCancellation'

describe('cancellationClient', () => {
  let fakeApprovedPremisesApi: nock.Scope
  let cancellationClient: CancellationClient

  const token = 'token-1'

  beforeEach(() => {
    config.apis.approvedPremises.url = 'http://localhost:8080'
    fakeApprovedPremisesApi = nock(config.apis.approvedPremises.url)
    cancellationClient = new CancellationClient(token)
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
    it('should create a cancellation', async () => {
      const newCancellation = newCancellationFactory.build()
      const cancellation = cancellationFactory.build()

      fakeApprovedPremisesApi
        .post(`/premises/premisesId/bookings/bookingId/cancellations`, newCancellation)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(201, cancellation)

      const result = await cancellationClient.create('premisesId', 'bookingId', newCancellation)

      expect(result).toEqual(cancellation)
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('get', () => {
    it('given a cancellation ID should return a cancellation', async () => {
      const cancellation = cancellationFactory.build()

      fakeApprovedPremisesApi
        .get(`/premises/premisesId/bookings/bookingId/cancellations/${cancellation.id}`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, cancellation)

      const result = await cancellationClient.get('premisesId', 'bookingId', cancellation.id)

      expect(result).toEqual(cancellation)
      expect(nock.isDone()).toBeTruthy()
    })
  })
})
