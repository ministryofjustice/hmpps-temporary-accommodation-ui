/* istanbul ignore file */

import { TemporaryAccommodationApplication, TemporaryAccommodationAssessment } from '@approved-premises/api'
import type { DataServices, PageResponse, TaskListErrors } from '@approved-premises/ui'
import { SessionData } from 'express-session'
import { CallConfig } from '../data/restClient'

export interface TasklistPageInterface {
  new (
    body: Record<string, unknown>,
    document?: TemporaryAccommodationApplication | TemporaryAccommodationAssessment,
    session?: Partial<SessionData>,
  ): TasklistPage

  initialize?(
    body: Record<string, unknown>,
    document: TemporaryAccommodationApplication | TemporaryAccommodationAssessment,
    callConfig: CallConfig,
    dataServices: DataServices,
    session?: Partial<SessionData>,
  ): Promise<TasklistPage>
}

export default abstract class TasklistPage {
  abstract title: string

  abstract htmlDocumentTitle: string

  abstract body: Record<string, unknown>

  abstract previous(): string

  abstract next(): string

  abstract errors(): TaskListErrors<this>

  abstract response(): PageResponse
}
