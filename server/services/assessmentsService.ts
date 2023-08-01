import type { TableRow } from '@approved-premises/ui'
import type { AssessmentClient, RestClientBuilder } from '../data'
import { CallConfig } from '../data/restClient'
import { assessmentTableRows } from '../utils/assessmentUtils'

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
}
