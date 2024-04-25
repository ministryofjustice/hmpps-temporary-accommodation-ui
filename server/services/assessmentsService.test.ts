import { AssessmentSearchApiStatus } from '@approved-premises/ui'
import { TemporaryAccommodationAssessmentStatus } from '@approved-premises/api'
import AssessmentClient from '../data/assessmentClient'
import { CallConfig } from '../data/restClient'
import {
  assessmentFactory,
  assessmentSummaryFactory,
  newReferralHistoryUserNoteFactory,
  referenceDataFactory,
  referralHistoryUserNoteFactory,
} from '../testutils/factories'
import { assessmentTableRows } from '../utils/assessmentUtils'
import AssessmentsService from './assessmentsService'
import assessmentSummaries from '../testutils/factories/assessmentSummaries'
import ReferenceDataClient from '../data/referenceDataClient'

jest.mock('../data/assessmentClient')
jest.mock('../utils/assessmentUtils')
jest.mock('../data/referenceDataClient.ts')

const assessmentId = 'some-id'

describe('AssessmentsService', () => {
  const assessmentClient = new AssessmentClient(null) as jest.Mocked<AssessmentClient>
  const referenceDataClient = new ReferenceDataClient(null) as jest.Mocked<ReferenceDataClient>

  const callConfig = { token: 'some-token' } as CallConfig

  const AssessmentClientFactory = jest.fn()
  const ReferenceDataClientFactory = jest.fn()

  const service = new AssessmentsService(AssessmentClientFactory, ReferenceDataClientFactory)

  beforeEach(() => {
    jest.resetAllMocks()
    AssessmentClientFactory.mockReturnValue(assessmentClient)
    ReferenceDataClientFactory.mockReturnValue(referenceDataClient)
  })

  describe('getAllForLoggedInUser', () => {
    it.each(['unallocated', 'in_review', 'ready_to_place'])(
      'returns paginated %s assessments summaries formatted for presentation in a table',
      async (uiStatus: AssessmentSearchApiStatus) => {
        const assessments = assessmentSummaryFactory
          .params({ status: uiStatus as TemporaryAccommodationAssessmentStatus })
          .buildList(2)
        const response = assessmentSummaries.build({ data: assessments, totalResults: 2 })

        assessmentClient.all.mockResolvedValue(response)
        ;(assessmentTableRows as jest.MockedFunction<typeof assessmentTableRows>).mockImplementation(assessment => {
          return [{ text: `Table row: ${assessment.status}` }]
        })

        const result = await service.getAllForLoggedInUser(callConfig, uiStatus, { page: 2 })

        expect(result.data).toEqual(assessments.map(() => [{ text: `Table row: ${uiStatus}` }]))

        expect(AssessmentClientFactory).toHaveBeenCalledWith(callConfig)
        expect(assessmentClient.all).toHaveBeenCalledWith([uiStatus], { page: 2 })

        assessments.forEach(assessment => expect(assessmentTableRows).toHaveBeenCalledWith(assessment, false))
      },
    )

    it('returns paginated and sorted archived assessment summaries formatted for presentation in a table', async () => {
      const closedAssessments = assessmentSummaryFactory.params({ status: 'closed' }).buildList(2)
      const rejectedAssessments = assessmentSummaryFactory.params({ status: 'rejected' }).buildList(2)
      const response = assessmentSummaries.build({ data: [...closedAssessments, ...rejectedAssessments] })

      assessmentClient.all.mockResolvedValue(response)
      ;(assessmentTableRows as jest.MockedFunction<typeof assessmentTableRows>).mockImplementation(assessment => {
        return [{ text: `Table row: ${assessment.status}` }]
      })

      const result = await service.getAllForLoggedInUser(callConfig, 'archived', {
        page: 1,
        sortBy: 'arrivalDate',
        sortDirection: 'desc',
      })

      expect(result.data).toEqual(response.data.map(assessment => [{ text: `Table row: ${assessment.status}` }]))

      expect(AssessmentClientFactory).toHaveBeenCalledWith(callConfig)
      expect(assessmentClient.all).toHaveBeenCalledWith(['closed', 'rejected'], {
        page: 1,
        sortBy: 'arrivalDate',
        sortDirection: 'desc',
      })

      response.data.forEach(assessment => expect(assessmentTableRows).toHaveBeenCalledWith(assessment, true))
    })
  })

  describe('findAssessment', () => {
    it('calls the find method on the assessment client and returns the result', async () => {
      const assessment = assessmentFactory.build()

      assessmentClient.find.mockResolvedValue(assessment)

      expect(await service.findAssessment(callConfig, assessmentId)).toEqual(assessment)

      expect(AssessmentClientFactory).toHaveBeenCalledWith(callConfig)
      expect(assessmentClient.find).toHaveBeenCalledWith(assessmentId)
    })
  })

  describe('getReferenceData', () => {
    it('should return the reference data needed to create departures', async () => {
      const referralRejectionReasons = referenceDataFactory.buildList(5)

      referenceDataClient.getReferenceData.mockResolvedValue(referralRejectionReasons)

      const result = await service.getReferenceData(callConfig)

      expect(result).toEqual({ referralRejectionReasons })

      expect(ReferenceDataClientFactory).toHaveBeenCalledWith(callConfig)

      expect(referenceDataClient.getReferenceData).toHaveBeenCalledWith('referral-rejection-reasons')
    })
  })

  describe('rejectAssessment', () => {
    it('calls the rejectAssessment method on the client with rejection details', async () => {
      await service.rejectAssessment(callConfig, assessmentId, 'rejection-reason-id', true)

      expect(AssessmentClientFactory).toHaveBeenCalledWith(callConfig)
      expect(assessmentClient.rejectAssessment).toHaveBeenCalledWith(assessmentId, 'rejection-reason-id', true)
    })
  })

  describe('updateAssessment', () => {
    it("calls the unallocateAssessment method on the client when the new status is 'unallocated'", async () => {
      await service.updateAssessmentStatus(callConfig, assessmentId, 'unallocated')

      expect(AssessmentClientFactory).toHaveBeenCalledWith(callConfig)
      expect(assessmentClient.unallocateAssessment).toHaveBeenCalledWith(assessmentId)
    })

    it("calls the allocateAssessment method on the client when the new status is 'in_review'", async () => {
      await service.updateAssessmentStatus(callConfig, assessmentId, 'in_review')

      expect(AssessmentClientFactory).toHaveBeenCalledWith(callConfig)
      expect(assessmentClient.allocateAssessment).toHaveBeenCalledWith(assessmentId)
    })

    it("calls the acceptAssessment method on the client when the new status is 'ready_to_place'", async () => {
      await service.updateAssessmentStatus(callConfig, assessmentId, 'ready_to_place')

      expect(AssessmentClientFactory).toHaveBeenCalledWith(callConfig)
      expect(assessmentClient.acceptAssessment).toHaveBeenCalledWith(assessmentId)
    })

    it("calls the closeAssessment method on the client when the new status is 'closed'", async () => {
      await service.updateAssessmentStatus(callConfig, assessmentId, 'closed')

      expect(AssessmentClientFactory).toHaveBeenCalledWith(callConfig)
      expect(assessmentClient.closeAssessment).toHaveBeenCalledWith(assessmentId)
    })
  })

  describe('getReadyToPlaceForCrn', () => {
    it('returns ready to place assessment summaries for the given CRN', async () => {
      const crn = 'some-crn'

      const assessments = assessmentSummaryFactory.buildList(5)
      assessmentClient.readyToPlaceForCrn.mockResolvedValue(assessments)

      const result = await service.getReadyToPlaceForCrn(callConfig, crn)

      expect(result).toEqual(assessments)
      expect(AssessmentClientFactory).toHaveBeenCalledWith(callConfig)
      expect(assessmentClient.readyToPlaceForCrn).toHaveBeenCalledWith(crn)
    })
  })

  describe('createNote', () => {
    it('returns a newly created user note', async () => {
      const newNote = newReferralHistoryUserNoteFactory.build()
      const note = referralHistoryUserNoteFactory.build()
      assessmentClient.createNote.mockResolvedValue(note)

      const result = await service.createNote(callConfig, assessmentId, newNote)

      expect(result).toEqual(note)
      expect(AssessmentClientFactory).toHaveBeenCalledWith(callConfig)
      expect(assessmentClient.createNote).toHaveBeenCalledWith(assessmentId, newNote)
    })
  })
})
