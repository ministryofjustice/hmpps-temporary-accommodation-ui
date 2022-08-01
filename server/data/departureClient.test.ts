import nock from 'nock'

import DepartureClient from './departureClient'
import config from '../config'
import departureFactory from '../testutils/factories/departure'

describe('DepartureClient', () => {
  let fakeApprovedPremisesApi: nock.Scope
  let departureClient: DepartureClient

  const token = 'token-1'

  beforeEach(() => {
    config.apis.approvedPremises.url = 'http://localhost:8080'
    fakeApprovedPremisesApi = nock(config.apis.approvedPremises.url)
    departureClient = new DepartureClient(token)
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
    it('should create a departure', async () => {
      const departure = departureFactory.build()

      fakeApprovedPremisesApi
        .post(`/premises/premisesId/bookings/bookingId/departures`, departure)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(201, departure)

      const result = await departureClient.create('premisesId', 'bookingId', departure)

      expect(result).toEqual(departure)
      expect(nock.isDone()).toBeTruthy()
    })
  })
})
