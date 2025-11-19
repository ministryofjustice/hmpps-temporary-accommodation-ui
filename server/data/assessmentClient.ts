import type {
  AssessmentAcceptance,
  TemporaryAccommodationAssessmentStatus as AssessmentStatus,
  Cas3Assessment,
  Cas3AssessmentRejection,
  Cas3AssessmentSummary,
  Cas3UpdateAssessment,
  Cas3ReferralHistoryUserNote as NewNote,
  ReferralHistoryNote as Note,
} from '@approved-premises/api'

import { AssessmentSearchParameters, PaginatedResponse } from '@approved-premises/ui'
import { URLSearchParams } from 'url'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'
import { appendQueryString } from '../utils/utils'
import RestClient, { CallConfig } from './restClient'

export default class AssessmentClient {
  restClient: RestClient

  constructor(callConfig: CallConfig) {
    this.restClient = new RestClient('assessmentClient', config.apis.approvedPremises as ApiConfig, callConfig)
  }

  async all(
    statuses: AssessmentStatus[],
    params?: AssessmentSearchParameters,
  ): Promise<PaginatedResponse<Cas3AssessmentSummary>> {
    const path = appendQueryString(paths.cas3.assessments.index.pattern, {
      statuses,
      ...params,
      perPage: config.assessmentsDefaultPageSize,
    })
    const response = await this.restClient.get<Array<Cas3AssessmentSummary>>({ path }, true)

    const { body, header } = response

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

  async readyToPlaceForCrn(crnOrName: string) {
    const status: Cas3AssessmentSummary['status'] = 'ready_to_place'

    return this.restClient.get<Array<Cas3AssessmentSummary>>({
      path: appendQueryString(paths.cas3.assessments.index.pattern, { crnOrName: crnOrName.trim(), statuses: status }),
    })
  }

  async find(assessmentId: string) {
    return this.restClient.get<Cas3Assessment>({ path: paths.cas3.assessments.show({ id: assessmentId }) })
  }

  async unallocateAssessment(id: string) {
    return this.restClient.delete<void>({
      path: paths.assessments.allocation({ id }),
    })
  }

  async allocateAssessment(id: string) {
    return this.restClient.post<void>({
      path: paths.assessments.allocation({ id }),
    })
  }

  async rejectAssessment(id: string, assessmentRejection: Cas3AssessmentRejection) {
    return this.restClient.post<void>({
      path: paths.cas3.assessments.rejection({ id }),
      data: assessmentRejection,
    })
  }

  async acceptAssessment(id: string) {
    return this.restClient.post<void>({
      path: paths.assessments.acceptance({ id }),
      data: { document: {} } as AssessmentAcceptance,
    })
  }

  async closeAssessment(id: string) {
    return this.restClient.post<void>({
      path: paths.cas3.assessments.closure({ id }),
    })
  }

  async createNote(id: string, data: NewNote) {
    return this.restClient.post<Note>({ path: paths.cas3.assessments.notes({ id }), data })
  }

  async update(id: string, data: Cas3UpdateAssessment) {
    const updateData = data
    return this.restClient.put<void>({ path: paths.cas3.assessments.update({ id }), data: updateData })
  }
}
