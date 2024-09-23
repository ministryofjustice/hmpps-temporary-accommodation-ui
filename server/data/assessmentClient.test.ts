import nock from 'nock'

import superagent from 'superagent'
import {
  TemporaryAccommodationAssessment as Assessment,
  AssessmentRejection,
  TemporaryAccommodationAssessmentStatus as AssessmentStatus,
} from '../@types/shared'
import config from '../config'
import paths from '../paths/api'
import { assessmentFactory, assessmentSummaryFactory, newReferralHistoryUserNoteFactory } from '../testutils/factories'
import AssessmentClient from './assessmentClient'
import { CallConfig } from './restClient'
import { appendQueryString } from '../utils/utils'
import assessmentSummaries from '../testutils/factories/assessmentSummaries'

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
    it.each([
      ['unallocated', ['unallocated' as const]],
      ['in review', ['in_review' as const]],
      ['ready to place', ['ready_to_place' as const]],
      ['archived', ['closed' as const, 'rejected' as const]],
    ])(
      'should get all %s assessments for the current user with pagination headers',
      async (_, apiStatuses: AssessmentStatus[]) => {
        const assessments = assessmentSummaries.build()

        fakeApprovedPremisesApi
          .defaultReplyHeaders({
            'x-pagination-currentpage': String(assessments.pageNumber),
            'x-pagination-pagesize': String(assessments.pageSize),
            'x-pagination-totalpages': String(assessments.totalPages),
            'x-pagination-totalresults': String(assessments.data.length),
          })
          .get(appendQueryString(paths.assessments.index({}), { statuses: apiStatuses, perPage: 10 }))
          .matchHeader('authorization', `Bearer ${callConfig.token}`)
          .reply(200, assessments.data)

        const result = await assessmentClient.all(apiStatuses)

        expect(result.data).toEqual(assessments.data)
        expect(result.pageNumber).toEqual(assessments.pageNumber)
        expect(result.pageSize).toEqual(assessments.pageSize)
        expect(result.totalPages).toEqual(assessments.totalPages)
        expect(result.totalResults).toEqual(assessments.data.length)
      },
    )

    it('should take a page parameter', async () => {
      const assessments = assessmentSummaries.build()

      fakeApprovedPremisesApi
        .get(appendQueryString(paths.assessments.index({}), { statuses: 'unallocated', page: 2, perPage: 10 }))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200, assessments.data)

      const result = await assessmentClient.all(['unallocated'], { page: 2 })

      expect(result.data).toEqual(assessments.data)
    })

    it('should take sorting parameters', async () => {
      const assessments = assessmentSummaries.build()

      fakeApprovedPremisesApi
        .get(
          appendQueryString(paths.assessments.index({}), {
            statuses: 'unallocated',
            sortBy: 'name',
            sortDirection: 'asc',
            perPage: 10,
          }),
        )
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200, assessments.data)

      const result = await assessmentClient.all(['unallocated'], { sortBy: 'name', sortDirection: 'asc' })

      expect(result.data).toEqual(assessments.data)
    })

    describe('default page size', () => {
      const envAssessmentsDefaultPageSize = config.assessmentsDefaultPageSize

      beforeEach(() => {
        config.assessmentsDefaultPageSize = 42
      })

      afterEach(() => {
        config.assessmentsDefaultPageSize = envAssessmentsDefaultPageSize
      })

      it('applies the default page size set for the environment', async () => {
        jest.spyOn(superagent, 'get')

        fakeApprovedPremisesApi
          .get(appendQueryString(paths.assessments.index({}), { statuses: 'unallocated', page: 1, perPage: 42 }))
          .matchHeader('authorization', `Bearer ${callConfig.token}`)
          .reply(200, [])

        await assessmentClient.all(['unallocated'], { page: 1 })

        expect(superagent.get).toHaveBeenCalledWith(
          'http://localhost:8080/assessments?statuses=unallocated&page=1&perPage=42',
        )
      })
    })
  })

  describe('readyToPlaceForCrn', () => {
    it('should get all ready to place assessments for the given CRN', async () => {
      const crn = 'some-crn'
      const status = 'ready_to_place' as AssessmentStatus
      const assessments = assessmentSummaryFactory.buildList(5)

      fakeApprovedPremisesApi
        .get(`${paths.assessments.index({})}?crnOrName=${crn}&statuses=${status}`)
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200, assessments)

      const output = await assessmentClient.readyToPlaceForCrn(crn)
      expect(output).toEqual(assessments)
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
      const assessmentRejection: AssessmentRejection = {
        document: {},
        rejectionRationale: 'default',
        referralRejectionReasonId: 'rejection-reason-id',
        isWithdrawn: false,
      }

      fakeApprovedPremisesApi
        .post(paths.assessments.rejection({ id: assessmentId }), assessmentRejection)
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200)

      await assessmentClient.rejectAssessment(assessmentId, assessmentRejection)
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

  describe('update', () => {
    it('puts updated data to the assessment', async () => {
      const updatedData: Partial<Assessment> = { accommodationRequiredFromDate: '2024-08-08' }

      fakeApprovedPremisesApi
        .put(paths.assessments.update({ id: assessmentId }))
        .matchHeader('authorization', `Bearer ${callConfig.token}`)
        .reply(200)

      await assessmentClient.update(assessmentId, updatedData)
    })
  })
})
