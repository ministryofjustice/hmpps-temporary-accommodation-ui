/* eslint-disable max-classes-per-file */
import type { TaskListErrors } from '@approved-premises/ui'
import TaskListPage from '../form-pages/tasklistPage'

export class ValidationError<T extends TaskListPage> extends Error {
  data: TaskListErrors<T>

  constructor(data: TaskListErrors<T>) {
    super('Validation error')
    this.data = data
  }
}

export class SessionDataError extends Error {}
export class UnknownPageError extends Error {}
export class UnknownTaskError extends Error {}

export class TasklistAPIError extends Error {
  field: string

  constructor(message: string, field: string) {
    super(message)
    this.field = field
  }
}

export class UnauthorizedError extends Error {
  status = 401
}
