import type {
  AssessmentSearchApiStatus,
  AssessmentSearchParameters,
  AssessmentUpdateStatus,
  PaginatedResponse,
  ReferenceData,
  TableRow,
} from '@approved-premises/ui'
import type {
  TemporaryAccommodationAssessment as Assessment,
  AssessmentRejection,
  NewReferralHistoryUserNote as NewNote,
  ReferralHistoryNote as Note,
  TemporaryAccommodationAssessmentStatus,
} from '../@types/shared'
import { AssessmentSummary } from '../@types/shared'
import type { AssessmentClient, ReferenceDataClient, RestClientBuilder } from '../data'
import { CallConfig } from '../data/restClient'
import { assessmentTableRows } from '../utils/assessmentUtils'
import { assertUnreachable } from '../utils/utils'

export type AssessmentReferenceData = {
  referralRejectionReasons: Array<ReferenceData>
}

export default class AssessmentsService {
  constructor(
    private readonly assessmentClientFactory: RestClientBuilder<AssessmentClient>,
    private readonly referenceDataClientFactory: RestClientBuilder<ReferenceDataClient>,
  ) {}

  async getAllForLoggedInUser(
    callConfig: CallConfig,
    uiStatus: AssessmentSearchApiStatus,
    params?: AssessmentSearchParameters,
  ): Promise<PaginatedResponse<TableRow>> {
    const statuses =
      uiStatus === 'archived' ? (['closed', 'rejected'] as TemporaryAccommodationAssessmentStatus[]) : [uiStatus]
    const assessmentClient = this.assessmentClientFactory(callConfig)
    const assessmentSummaries = await assessmentClient.all(statuses, params)

    return {
      ...assessmentSummaries,
      data: assessmentSummaries.data.map(summary => assessmentTableRows(summary, uiStatus === 'archived')),
    }
  }

  findAssessment(callConfig: CallConfig, assessmentId: string): Promise<Assessment> {
    const assessmentClient = this.assessmentClientFactory(callConfig)

    return assessmentClient.find(assessmentId)
  }

  async getReferenceData(callConfig: CallConfig): Promise<AssessmentReferenceData> {
    const referenceDataClient = this.referenceDataClientFactory(callConfig)

    return {
      referralRejectionReasons: await referenceDataClient.getReferenceData('referral-rejection-reasons'),
    }
  }

  async rejectAssessment(
    callConfig: CallConfig,
    assessmentId: string,
    assessmentRejection: AssessmentRejection,
  ): Promise<void> {
    const assessmentClient = this.assessmentClientFactory(callConfig)

    await assessmentClient.rejectAssessment(assessmentId, assessmentRejection)
  }

  async updateAssessmentStatus(
    callConfig: CallConfig,
    assessmentId: string,
    status: AssessmentUpdateStatus,
  ): Promise<void> {
    const assessmentClient = this.assessmentClientFactory(callConfig)

    switch (status) {
      case 'unallocated':
        await assessmentClient.unallocateAssessment(assessmentId)
        break
      case 'in_review':
        await assessmentClient.allocateAssessment(assessmentId)
        break
      case 'ready_to_place':
        await assessmentClient.acceptAssessment(assessmentId)
        break
      case 'closed':
        await assessmentClient.closeAssessment(assessmentId)
        break

      default:
        assertUnreachable(status)
    }
  }

  async getReadyToPlaceForCrn(callConfig: CallConfig, crn: string): Promise<Array<AssessmentSummary>> {
    const assessmentClient = this.assessmentClientFactory(callConfig)
    return assessmentClient.readyToPlaceForCrn(crn)
  }

  async createNote(callConfig: CallConfig, assessmentId: string, newNote: NewNote): Promise<Note> {
    const assessmentClient = this.assessmentClientFactory(callConfig)
    return assessmentClient.createNote(assessmentId, newNote)
  }

  async updateAssessment(callConfig: CallConfig, assessmentId: string, updateData: Partial<Assessment>) {
    const assessmentClient = this.assessmentClientFactory(callConfig)
    return assessmentClient.update(assessmentId, updateData)
  }
}
