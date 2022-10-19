import type { Request } from 'express'

import type { TaskListErrors } from '@approved-premises/ui'
import type { DataServices } from '../services/applicationService'

export default abstract class TasklistPage {
  abstract name: string

  abstract title: string

  body?: Record<string, unknown>

  previous?(): string

  next?(): string

  errors?(): TaskListErrors

  async setup?(request: Request, dataServices: DataServices): Promise<void>
}
