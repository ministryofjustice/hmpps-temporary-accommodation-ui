import nock from 'nock'

import { TemporaryAccommodationAssessmentStatus as AssessmentStatus } from '../@types/shared'
import config from '../config'
import paths from '../paths/api'
import { assessmentFactory, assessmentSummaryFactory, newReferralHistoryUserNoteFactory } from '../testutils/factories'
import AssessmentClient from './assessmentClient'
import { CallConfig } from './restClient'
import { appendQueryString } from '../utils/utils'

const assessmentId = 'some-id'

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

    it.each([
      ['unallocated', ['unallocated' as const]],
      ['in review', ['in_review' as const]],
      ['ready to place', ['ready_to_place' as const]],
      ['archived', ['closed' as const, 'rejected' as const]],
    ])('should get all %s assessments for the current user', async (_, apiStatuses: AssessmentStatus[]) => {
      fakeApprovedPremisesApi
        .get(appendQueryString(paths.assessments.index({}), { statuses: apiStatuses }))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200, assessmentSummaries)

      const output = await assessmentClient.all(apiStatuses)
      expect(output).toEqual(assessmentSummaries)
    })
  })

  describe('readyToPlaceForCrn', () => {
    it('should get all ready to place assessments for the given CRN', async () => {
      const crn = 'some-crn'
      const status = 'ready_to_place' as AssessmentStatus
      const assessmentSummaries = assessmentSummaryFactory.buildList(5)

      fakeApprovedPremisesApi
        .get(`${paths.assessments.index({})}?crn=${crn}&statuses=${status}`)
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200, assessmentSummaries)

      const output = await assessmentClient.readyToPlaceForCrn(crn)
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

  describe('unallocateAssessment', () => {
    it('deletes the allocation for the assessment', async () => {
      fakeApprovedPremisesApi
        .delete(paths.assessments.allocation({ id: assessmentId }))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200)

      await assessmentClient.unallocateAssessment(assessmentId)
    })
  })

  describe('allocateAssessment', () => {
    it('posts a new allocation for the assessment', async () => {
      fakeApprovedPremisesApi
        .post(paths.assessments.allocation({ id: assessmentId }), {})
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200)

      await assessmentClient.allocateAssessment(assessmentId)
    })
  })

  describe('rejectAssessment', () => {
    it('posts a new rejection for the assessment', async () => {
      fakeApprovedPremisesApi
        .post(paths.assessments.rejection({ id: assessmentId }), { document: {}, rejectionRationale: 'default' })
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200)

      await assessmentClient.rejectAssessment(assessmentId)
    })
  })

  describe('acceptAssessment', () => {
    it('posts a new acceptance for the assessment', async () => {
      fakeApprovedPremisesApi
        .post(paths.assessments.acceptance({ id: assessmentId }), { document: {} })
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200)

      await assessmentClient.acceptAssessment(assessmentId)
    })
  })

  describe('closeAssessment', () => {
    it('posts a new closure for the assessment', async () => {
      fakeApprovedPremisesApi
        .post(paths.assessments.closure({ id: assessmentId }), {})
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200)

      await assessmentClient.closeAssessment(assessmentId)
    })
  })

  describe('createNote', () => {
    it('post a new referral note', async () => {
      const newNote = newReferralHistoryUserNoteFactory.build()

      fakeApprovedPremisesApi
        .post(paths.assessments.notes({ id: assessmentId }))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200)

      await assessmentClient.createNote(assessmentId, newNote)
    })
  })
})
