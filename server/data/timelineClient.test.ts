import nock from 'nock'

import { fakerEN_GB as faker } from '@faker-js/faker'
import config from '../config'
import paths from '../paths/api'
import TimelineClient from './timelineClient'

import { CallConfig } from './restClient'
import { referralHistorySystemNoteFactory } from '../testutils/factories'

describe('Timeline client', () => {
  let fakeApprovedPremisesApi: nock.Scope
  let timelineClient: TimelineClient

  const callConfig = { token: 'some-token' } as CallConfig

  beforeEach(() => {
    config.apis.approvedPremises.url = 'http://localhost:8080'
    fakeApprovedPremisesApi = nock(config.apis.approvedPremises.url)
    timelineClient = new TimelineClient(callConfig)
  })

  afterEach(() => {
    if (!nock.isDone()) {
      nock.cleanAll()
      throw new Error('Not all nock interceptors were used!')
    }
    nock.abortPendingRequests()
    nock.cleanAll()
  })

  describe('fetch', () => {
    it('returns timeline results', async () => {
      const results = referralHistorySystemNoteFactory.build()
      const payload = faker.string.uuid()

      fakeApprovedPremisesApi
        .get(paths.assessments.timeline({ assessmentId: payload }))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(201, results)

      const result = await timelineClient.fetch(payload)

      expect(result).toEqual(results)
      expect(nock.isDone()).toBeTruthy()
    })
  })
})
