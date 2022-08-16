import nock from 'nock'

import CancellationClient from './cancellationClient'
import config from '../config'
import cancellationFactory from '../testutils/factories/cancellation'
import cancellationDtoFactory from '../testutils/factories/cancellationDto'

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
      const cancellationDto = cancellationDtoFactory.build()
      const cancellation = cancellationFactory.build()

      fakeApprovedPremisesApi
        .post(`/premises/premisesId/bookings/bookingId/cancellations`, cancellationDto)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(201, cancellation)

      const result = await cancellationClient.create('premisesId', 'bookingId', cancellationDto)

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
