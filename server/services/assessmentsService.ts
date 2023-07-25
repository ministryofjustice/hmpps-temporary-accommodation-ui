import type { TableRow } from '@approved-premises/ui'
import type {
  TemporaryAccommodationAssessment as Assessment,
  TemporaryAccommodationAssessmentStatus as AssessmentStatus,
} from '../@types/shared'
import type { AssessmentClient, RestClientBuilder } from '../data'
import { CallConfig } from '../data/restClient'
import { assessmentTableRows } from '../utils/assessmentUtils'
import { assertUnreachable } from '../utils/utils'

export default class AssessmentsService {
  constructor(private readonly assessmentClientFactory: RestClientBuilder<AssessmentClient>) {}

  async getAllForLoggedInUser(callConfig: CallConfig): Promise<{
    unallocatedTableRows: Array<TableRow>
    inProgressTableRows: Array<TableRow>
    readyToPlaceTableRows: Array<TableRow>
    archivedTableRows: Array<TableRow>
  }> {
    const assessmentClient = this.assessmentClientFactory(callConfig)
    const assessmentSummaries = await assessmentClient.all()
    const result = {
      unallocatedTableRows: [] as Array<TableRow>,
      inProgressTableRows: [] as Array<TableRow>,
      readyToPlaceTableRows: [] as Array<TableRow>,
      archivedTableRows: [] as Array<TableRow>,
    }

    await Promise.all(
      assessmentSummaries.map(async summary => {
        switch (summary.status) {
          case 'unallocated':
            result.unallocatedTableRows.push(assessmentTableRows(summary))
            break
          case 'ready_to_place':
            result.readyToPlaceTableRows.push(assessmentTableRows(summary))
            break
          case 'closed':
            result.archivedTableRows.push(assessmentTableRows(summary, true))
            break
          case 'rejected':
            result.archivedTableRows.push(assessmentTableRows(summary, true))
            break
          case 'in_review':
            result.inProgressTableRows.push(assessmentTableRows(summary))
            break
          default:
            break
        }
      }),
    )

    return result
  }

  findAssessment(callConfig: CallConfig, assessmentId: string): Promise<Assessment> {
    const assessmentClient = this.assessmentClientFactory(callConfig)

    return assessmentClient.find(assessmentId)
  }

  async updateAssessmentStatus(callConfig: CallConfig, assessmentId: string, status: AssessmentStatus): Promise<void> {
    const assessmentClient = this.assessmentClientFactory(callConfig)

    switch (status) {
      case 'unallocated':
        await assessmentClient.unallocateAssessment(assessmentId)
        break
      case 'in_review':
        await assessmentClient.allocateAssessment(assessmentId)
        break
      case 'rejected':
        await assessmentClient.rejectAssessment(assessmentId)
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
}
