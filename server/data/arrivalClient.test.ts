import nock from 'nock'

import ArrivalClient from './arrivalClient'
import config from '../config'
import arrivalFactory from '../testutils/factories/arrival'

describe('PremisesClient', () => {
  let fakeApprovedPremisesApi: nock.Scope
  let arrivalClient: ArrivalClient

  const token = 'token-1'

  beforeEach(() => {
    config.apis.approvedPremises.url = 'http://localhost:8080'
    fakeApprovedPremisesApi = nock(config.apis.approvedPremises.url)
    arrivalClient = new ArrivalClient(token)
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
    it('should create an arrival', async () => {
      const arrival = arrivalFactory.build()
      const payload = {
        date: arrival.date.toString(),
        expectedDepartureDate: arrival.expectedDepartureDate.toString(),
        notes: arrival.notes,
        name: arrival.name,
        crn: arrival.crn,
      }

      fakeApprovedPremisesApi
        .post(`/premises/premisesId/bookings/bookingId/arrivals`, payload)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(201, arrival)

      const result = await arrivalClient.create('premisesId', 'bookingId', payload)

      expect(result).toEqual({
        ...arrival,
        date: arrival.date,
        expectedDepartureDate: arrival.expectedDepartureDate,
      })
      expect(nock.isDone()).toBeTruthy()
    })
  })
})
