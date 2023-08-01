import nock from 'nock'

import config from '../config'
import paths from '../paths/api'
import { assessmentFactory, assessmentSummaryFactory } from '../testutils/factories'
import AssessmentClient from './assessmentClient'
import { CallConfig } from './restClient'

describe('AssessmentClient', () => {
  let fakeApprovedPremisesApi: nock.Scope
  let assessmentClient: AssessmentClient

  const callConfig = { token: 'some-token' } as CallConfig

  beforeEach(() => {
    config.apis.approvedPremises.url = 'http://localhost:8080'
    fakeApprovedPremisesApi = nock(config.apis.approvedPremises.url)
    assessmentClient = new AssessmentClient(callConfig)
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
    const assessmentSummaries = assessmentSummaryFactory.buildList(5)

    it('should get all assessments for the current user', async () => {
      fakeApprovedPremisesApi
        .get(paths.assessments.index({}))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200, assessmentSummaries)

      const output = await assessmentClient.all()
      expect(output).toEqual(assessmentSummaries)
    })
  })

  describe('find', () => {
    const assessment = assessmentFactory.build()

    it('should get a single assessment', async () => {
      fakeApprovedPremisesApi
        .get(paths.assessments.show({ id: assessment.id }))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200, assessment)

      const output = await assessmentClient.find(assessment.id)
      expect(output).toEqual(assessment)
    })
  })
})
