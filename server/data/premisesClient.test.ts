import nock from 'nock'

import config from '../config'
import paths from '../paths/api'
import {
  cas3PremisesSummaryFactory,
  dateCapacityFactory,
  newPremisesFactory,
  premisesFactory,
  premisesSummaryFactory,
  staffMemberFactory,
  updatePremisesFactory,
} from '../testutils/factories'
import PremisesClient from './premisesClient'
import { CallConfig } from './restClient'

describe('PremisesClient', () => {
  let fakeApprovedPremisesApi: nock.Scope
  let premisesClient: PremisesClient

  const callConfig = { token: 'some-token' } as CallConfig

  beforeEach(() => {
    config.apis.approvedPremises.url = 'http://localhost:8080'
    fakeApprovedPremisesApi = nock(config.apis.approvedPremises.url)
    premisesClient = new PremisesClient(callConfig)
  })

  afterEach(() => {
    if (!nock.isDone()) {
      nock.cleanAll()
      throw new Error('Not all nock interceptors were used!')
    }
    nock.abortPendingRequests()
    nock.cleanAll()
  })

  describe('all', () => {
    const premisesSummaries = premisesSummaryFactory.buildList(5)

    it('should get all premises for the given service', async () => {
      fakeApprovedPremisesApi
        .get(paths.premises.index({}))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200, premisesSummaries)

      const output = await premisesClient.all()
      expect(output).toEqual(premisesSummaries)
    })
  })

  describe('search', () => {
    const premisesSummaries = [
      cas3PremisesSummaryFactory.build({ postcode: 'NE1 1AB' }),
      cas3PremisesSummaryFactory.build({ postcode: 'NE1 2BC' }),
      cas3PremisesSummaryFactory.build({ postcode: 'NE1 3CD' }),
      cas3PremisesSummaryFactory.build({ postcode: 'NE1 4DE' }),
    ]

    it('should get all premises matching the postcode search query', async () => {
      fakeApprovedPremisesApi
        .get(paths.premises.index({}))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .query({ postcodeOrAddress: 'NE1' })
        .reply(200, premisesSummaries)

      const output = await premisesClient.search('NE1')
      expect(output).toEqual(premisesSummaries)
    })
  })

  describe('find', () => {
    const premises = premisesFactory.build()

    it('should get a single premises', async () => {
      fakeApprovedPremisesApi
        .get(paths.premises.show({ premisesId: premises.id }))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200, premises)

      const output = await premisesClient.find(premises.id)
      expect(output).toEqual(premises)
    })
  })

  describe('capacity', () => {
    const premisesId = 'premisesId'
    const premisesCapacityItem = dateCapacityFactory.build()

    it('should get the capacity of a premises for a given date', async () => {
      fakeApprovedPremisesApi
        .get(paths.premises.capacity({ premisesId }))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200, premisesCapacityItem)

      const output = await premisesClient.capacity(premisesId)
      expect(output).toEqual(premisesCapacityItem)
    })
  })

  describe('getStaffMembers', () => {
    const premises = premisesFactory.build()
    const staffMembers = staffMemberFactory.buildList(5)

    it('should return a list of staff members', async () => {
      fakeApprovedPremisesApi
        .get(paths.premises.staffMembers.index({ premisesId: premises.id }))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200, staffMembers)

      const output = await premisesClient.getStaffMembers(premises.id)
      expect(output).toEqual(staffMembers)
    })
  })

  describe('create', () => {
    it('should return the premises that has been created', async () => {
      const premises = premisesFactory.build()
      const payload = newPremisesFactory.build({
        name: premises.name,
        postcode: premises.postcode,
      })

      fakeApprovedPremisesApi
        .post(paths.premises.create({}))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(201, premises)

      const output = await premisesClient.create(payload)
      expect(output).toEqual(premises)
    })
  })

  describe('update', () => {
    it('updates the given premises and returns the updated premises', async () => {
      const premises = premisesFactory.build()
      const payload = updatePremisesFactory.build({
        postcode: premises.postcode,
        notes: premises.notes,
      })

      fakeApprovedPremisesApi
        .put(paths.premises.update({ premisesId: premises.id }))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200, premises)

      const output = await premisesClient.update(premises.id, payload)
      expect(output).toEqual(premises)
    })
  })
})
