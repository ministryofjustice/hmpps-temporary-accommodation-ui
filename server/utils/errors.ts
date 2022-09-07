/* eslint-disable max-classes-per-file */
import type { TaskListErrors } from 'approved-premises'

export class ValidationError extends Error {
  data: TaskListErrors

  constructor(data: TaskListErrors) {
    super('Validation error')
    this.data = data
  }
}

export class UnknownPageError extends Error {}
