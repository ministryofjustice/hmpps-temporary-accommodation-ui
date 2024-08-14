import type {
  TemporaryAccommodationAssessment as Assessment,
  AssessmentAcceptance,
  AssessmentRejection,
  TemporaryAccommodationAssessmentStatus as AssessmentStatus,
  TemporaryAccommodationAssessmentSummary as AssessmentSummary,
  NewReferralHistoryUserNote as NewNote,
  ReferralHistoryNote as Note,
} from '@approved-premises/api'

import { AssessmentSearchParameters, PaginatedResponse } from '@approved-premises/ui'
import { URLSearchParams } from 'url'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'
import { appendQueryString } from '../utils/utils'
import RestClient, { CallConfig } from './restClient'

type SearchResponse = {
  body: Array<AssessmentSummary>
  header: Record<string, string>
}

export default class AssessmentClient {
  restClient: RestClient

  constructor(callConfig: CallConfig) {
    this.restClient = new RestClient('assessmentClient', config.apis.approvedPremises as ApiConfig, callConfig)
  }

  async all(
    statuses: AssessmentStatus[],
    params?: AssessmentSearchParameters,
  ): Promise<PaginatedResponse<AssessmentSummary>> {
    const path = appendQueryString(paths.assessments.index.pattern, {
      statuses,
      ...params,
      perPage: config.assessmentsDefaultPageSize,
    })
    const response = await this.restClient.get({ path, raw: true })

    const { body, header } = response as SearchResponse

    return {
      url: {
        params: new URLSearchParams(path),
      },
      data: body,
      pageNumber: Number(header['x-pagination-currentpage']),
      pageSize: Number(header['x-pagination-pagesize']),
      totalPages: Number(header['x-pagination-totalpages']),
      totalResults: Number(header['x-pagination-totalresults']),
    }
  }

  async readyToPlaceForCrn(crn: string): Promise<Array<AssessmentSummary>> {
    const status: AssessmentSummary['status'] = 'ready_to_place'

    return (await this.restClient.get({
      path: appendQueryString(paths.assessments.index.pattern, { crn: crn.trim(), statuses: status }),
    })) as Array<AssessmentSummary>
  }

  async find(assessmentId: string): Promise<Assessment> {
    return (await this.restClient.get({ path: paths.assessments.show({ id: assessmentId }) })) as Assessment
  }

  async unallocateAssessment(id: string): Promise<void> {
    await this.restClient.delete({
      path: paths.assessments.allocation({ id }),
    })
  }

  async allocateAssessment(id: string): Promise<void> {
    await this.restClient.post({
      path: paths.assessments.allocation({ id }),
    })
  }

  async rejectAssessment(id: string, assessmentRejection: AssessmentRejection): Promise<void> {
    await this.restClient.post({
      path: paths.assessments.rejection({ id }),
      data: assessmentRejection,
    })
  }

  async acceptAssessment(id: string): Promise<void> {
    await this.restClient.post({
      path: paths.assessments.acceptance({ id }),
      data: { document: {} } as AssessmentAcceptance,
    })
  }

  async closeAssessment(id: string): Promise<void> {
    await this.restClient.post({
      path: paths.assessments.closure({ id }),
    })
  }

  async createNote(id: string, data: NewNote): Promise<Note> {
    return (await this.restClient.post({ path: paths.assessments.notes({ id }), data })) as Note
  }

  async update(id: string, data: Partial<Assessment>): Promise<void> {
    const updateData = { data: {}, ...data }
    await this.restClient.put({ path: paths.assessments.update({ id }), data: updateData })
  }
}
