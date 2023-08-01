import AssessmentClient from '../data/assessmentClient'
import { CallConfig } from '../data/restClient'
import { assessmentSummaryFactory } from '../testutils/factories'
import { assessmentTableRows } from '../utils/assessmentUtils'
import AssessmentsService from './assessmentsService'

jest.mock('../data/assessmentClient')
jest.mock('../utils/assessmentUtils')

describe('AssessmentsService', () => {
  const assessmentClient = new AssessmentClient(null) as jest.Mocked<AssessmentClient>

  const asessmentClientFactory = jest.fn()

  const service = new AssessmentsService(asessmentClientFactory)
  const callConfig = { token: 'some-token' } as CallConfig

  beforeEach(() => {
    jest.resetAllMocks()
    asessmentClientFactory.mockReturnValue(assessmentClient)
  })

  describe('getAllForLoggedInUser', () => {
    it('returns assessments summaries formatted for presentation in a table', async () => {
      const unallocatedAssessments = assessmentSummaryFactory
        .params({
          status: 'unallocated',
        })
        .buildList(2)
      const inProgressAssessments = assessmentSummaryFactory
        .params({
          status: 'in_review',
        })
        .buildList(2)
      const readyToPlaceAssessments = assessmentSummaryFactory
        .params({
          status: 'ready_to_place',
        })
        .buildList(2)
      const closedAssessments = assessmentSummaryFactory
        .params({
          status: 'closed',
        })
        .buildList(1)
      const rejectedAssessments = assessmentSummaryFactory
        .params({
          status: 'rejected',
        })
        .buildList(1)
      const archivedAssessments = [...closedAssessments, ...rejectedAssessments]

      assessmentClient.all.mockResolvedValue([
        ...unallocatedAssessments,
        ...inProgressAssessments,
        ...readyToPlaceAssessments,
        ...archivedAssessments,
      ])
      ;(assessmentTableRows as jest.MockedFunction<typeof assessmentTableRows>).mockImplementation(assessment => {
        switch (assessment.status) {
          case 'unallocated':
            return [{ text: 'Unallocated table row' }]
          case 'in_review':
            return [{ text: 'In progress table row' }]
          case 'ready_to_place':
            return [{ text: 'Ready to place table row' }]
          case 'closed':
            return [{ text: 'Archived table row' }]
          case 'rejected':
            return [{ text: 'Archived table row' }]
          default:
            return [{ text: 'Unknown table row' }]
        }
      })

      const { unallocatedTableRows, inProgressTableRows, readyToPlaceTableRows, archivedTableRows } =
        await service.getAllForLoggedInUser(callConfig)

      expect(unallocatedTableRows).toEqual(unallocatedAssessments.map(() => [{ text: 'Unallocated table row' }]))
      expect(inProgressTableRows).toEqual(inProgressAssessments.map(() => [{ text: 'In progress table row' }]))
      expect(readyToPlaceTableRows).toEqual(readyToPlaceAssessments.map(() => [{ text: 'Ready to place table row' }]))
      expect(archivedTableRows).toEqual(archivedAssessments.map(() => [{ text: 'Archived table row' }]))

      expect(asessmentClientFactory).toHaveBeenCalledWith(callConfig)
      expect(assessmentClient.all).toHaveBeenCalledWith()

      unallocatedAssessments.forEach(unallocatedAssessment =>
        expect(assessmentTableRows).toHaveBeenCalledWith(unallocatedAssessment),
      )
      inProgressAssessments.forEach(inProgressAssessment =>
        expect(assessmentTableRows).toHaveBeenCalledWith(inProgressAssessment),
      )
      readyToPlaceAssessments.forEach(readyToPlaceAssessment =>
        expect(assessmentTableRows).toHaveBeenCalledWith(readyToPlaceAssessment),
      )
      archivedAssessments.forEach(archivedAssessment =>
        expect(assessmentTableRows).toHaveBeenCalledWith(archivedAssessment, true),
      )
    })
  })
})
