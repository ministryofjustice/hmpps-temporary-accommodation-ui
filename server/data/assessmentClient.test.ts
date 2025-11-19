import { fakerEN_GB as faker } from '@faker-js/faker'
import {
  Cas3Assessment as Assessment,
  TemporaryAccommodationAssessmentStatus as AssessmentStatus,
  Cas3AssessmentRejection,
  Cas3UpdateAssessment,
} from '../@types/shared'
import config from '../config'
import paths from '../paths/api'
import {
  cas3AssessmentFactory,
  cas3AssessmentSummariesFactory,
  cas3AssessmentSummaryFactory,
  cas3ReferralHistoryUserNoteFactory,
} from '../testutils/factories'
import AssessmentClient from './assessmentClient'
import { CallConfig } from './restClient'
import describeClient from '../testutils/describeClient'

describeClient('AssessmentClient', provider => {
  let assessmentClient: AssessmentClient
  let assessment: Assessment
  let assessments: ReturnType<typeof cas3AssessmentSummariesFactory.build>
  let assessmentSummaryList: Array<ReturnType<typeof cas3AssessmentSummaryFactory.build>>
  let newNote: ReturnType<typeof cas3ReferralHistoryUserNoteFactory.build>
  const callConfig = { token: 'some-token' } as CallConfig

  beforeEach(() => {
    assessmentClient = new AssessmentClient(callConfig)
    assessment = cas3AssessmentFactory.build()
    assessments = cas3AssessmentSummariesFactory.build()
    assessmentSummaryList = cas3AssessmentSummaryFactory.buildList(5)
    newNote = cas3ReferralHistoryUserNoteFactory.build()
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
        await provider.addInteraction({
          state: `Assessments exist for statuses: ${apiStatuses.join(', ')}`,
          uponReceiving: `a request for ${apiStatuses.join(', ')} assessments`,
          withRequest: {
            method: 'GET',
            path: paths.cas3.assessments.index({}),
            query: {
              statuses: apiStatuses,
              perPage: '10',
            },
            headers: {
              authorization: `Bearer ${callConfig.token}`,
            },
          },
          willRespondWith: {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
            body: assessments.data,
          },
        })

        const result = await assessmentClient.all(apiStatuses)
        expect(result.data).toEqual(assessments.data)
      },
    )

    it('should take a page parameter', async () => {
      await provider.addInteraction({
        state: 'Assessments exist for unallocated',
        uponReceiving: 'a request for unallocated assessments with page param',
        withRequest: {
          method: 'GET',
          path: paths.cas3.assessments.index({}),
          query: {
            statuses: 'unallocated',
            page: '2',
            perPage: '10',
          },
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: assessments.data,
        },
      })

      const result = await assessmentClient.all(['unallocated'], { page: 2 })
      expect(result.data).toEqual(assessments.data)
    })

    it('should take sorting parameters', async () => {
      await provider.addInteraction({
        state: 'Assessments exist for unallocated',
        uponReceiving: 'a request for unallocated assessments with sorting',
        withRequest: {
          method: 'GET',
          path: paths.cas3.assessments.index({}),
          query: {
            statuses: 'unallocated',
            sortBy: 'name',
            sortDirection: 'asc',
            perPage: '10',
          },
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: assessments.data,
        },
      })

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
        await provider.addInteraction({
          state: 'Assessments exist for unallocated',
          uponReceiving: 'a request for unallocated assessments with default page size',
          withRequest: {
            method: 'GET',
            path: paths.cas3.assessments.index({}),
            query: {
              statuses: 'unallocated',
              page: '1',
              perPage: '42',
            },
            headers: {
              authorization: `Bearer ${callConfig.token}`,
            },
          },
          willRespondWith: {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: [],
          },
        })

        const result = await assessmentClient.all(['unallocated'], { page: 1 })
        expect(result.data).toEqual([])
      })
    })
  })

  describe('readyToPlaceForCrn', () => {
    it('should get all ready to place assessments for the given CRN', async () => {
      const crn = 'some-crn'
      const status = 'ready_to_place' as AssessmentStatus

      await provider.addInteraction({
        state: 'Ready to place assessments exist for CRN',
        uponReceiving: 'a request for ready to place assessments by CRN',
        withRequest: {
          method: 'GET',
          path: paths.cas3.assessments.index({}),
          query: {
            crnOrName: crn,
            statuses: status,
          },
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: assessmentSummaryList,
        },
      })

      const output = await assessmentClient.readyToPlaceForCrn(crn)
      expect(output).toEqual(assessmentSummaryList)
    })
  })

  describe('find', () => {
    it('should get a single assessment', async () => {
      await provider.addInteraction({
        state: 'Assessment exists',
        uponReceiving: 'a request for a single assessment',
        withRequest: {
          method: 'GET',
          path: paths.cas3.assessments.show({ id: assessment.id }),
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: assessment,
        },
      })

      const output = await assessmentClient.find(assessment.id)
      expect(output).toEqual(assessment)
    })
  })

  describe('unallocateAssessment', () => {
    it('deletes the allocation for the assessment', async () => {
      await provider.addInteraction({
        state: 'Assessment allocation exists',
        uponReceiving: 'a request to delete assessment allocation',
        withRequest: {
          method: 'DELETE',
          path: paths.assessments.allocation({ id: assessment.id }),
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
        },
        willRespondWith: {
          status: 200,
        },
      })

      await assessmentClient.unallocateAssessment(assessment.id)
    })
  })

  describe('allocateAssessment', () => {
    it('posts a new allocation for the assessment', async () => {
      await provider.addInteraction({
        state: 'Assessment can be allocated',
        uponReceiving: 'a request to allocate assessment',
        withRequest: {
          method: 'POST',
          path: paths.assessments.allocation({ id: assessment.id }),
          headers: {
            authorization: `Bearer ${callConfig.token}`,
            'X-Service-Name': 'temporary-accommodation',
          },
          body: {},
        },
        willRespondWith: {
          status: 201,
        },
      })

      await assessmentClient.allocateAssessment(assessment.id)
    })
  })

  describe('rejectAssessment', () => {
    it('posts a new rejection for the assessment', async () => {
      const assessmentRejection: Cas3AssessmentRejection = {
        document: {},
        rejectionRationale: 'default',
        referralRejectionReasonId: faker.string.uuid(),
        isWithdrawn: false,
      }

      await provider.addInteraction({
        state: 'Assessment can be rejected',
        uponReceiving: 'a request to reject assessment',
        withRequest: {
          method: 'POST',
          path: paths.cas3.assessments.rejection({ id: assessment.id }),
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
          body: assessmentRejection,
        },
        willRespondWith: {
          status: 200,
        },
      })

      await assessmentClient.rejectAssessment(assessment.id, assessmentRejection)
    })
  })

  describe('acceptAssessment', () => {
    it('posts a new acceptance for the assessment', async () => {
      await provider.addInteraction({
        state: 'Assessment can be accepted',
        uponReceiving: 'a request to accept assessment',
        withRequest: {
          method: 'POST',
          path: paths.assessments.acceptance({ id: assessment.id }),
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
          body: { document: {} },
        },
        willRespondWith: {
          status: 200,
        },
      })

      await assessmentClient.acceptAssessment(assessment.id)
    })
  })

  describe('closeAssessment', () => {
    it('posts a new closure for the assessment', async () => {
      await provider.addInteraction({
        state: 'Assessment can be closed',
        uponReceiving: 'a request to close assessment',
        withRequest: {
          method: 'POST',
          path: paths.cas3.assessments.closure({ id: assessment.id }),
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
        },
        willRespondWith: {
          status: 200,
        },
      })

      await assessmentClient.closeAssessment(assessment.id)
    })
  })

  describe('createNote', () => {
    it('post a new referral note', async () => {
      await provider.addInteraction({
        state: 'Assessment note can be created',
        uponReceiving: 'a request to create assessment note',
        withRequest: {
          method: 'POST',
          path: paths.cas3.assessments.notes({ id: assessment.id }),
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
          body: newNote,
        },
        willRespondWith: {
          status: 200,
        },
      })

      await assessmentClient.createNote(assessment.id, newNote)
    })
  })

  describe('update', () => {
    it('puts updated data to the assessment', async () => {
      const updatedData = {
        accommodationRequiredFromDate: '2024-08-08',
        releaseDate: '2024-08-08',
      } as Cas3UpdateAssessment

      await provider.addInteraction({
        state: 'Assessment can be updated',
        uponReceiving: 'a request to update assessment',
        withRequest: {
          method: 'PUT',
          path: paths.cas3.assessments.update({ id: assessment.id }),
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
          body: updatedData,
        },
        willRespondWith: {
          status: 200,
        },
      })

      await assessmentClient.update(assessment.id, updatedData)
    })
  })
})
