import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { TaskListErrors } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import { personName } from '../../../../utils/personUtils'
import TasklistPage from '../../../tasklistPage'

export type OffendingSummaryBody = {
  summary: string
}

@Page({ name: 'offending-summary', bodyProperties: ['summary'] })
export default class OffendingSummary implements TasklistPage {
  title: string

  constructor(
    readonly body: Partial<OffendingSummaryBody>,
    readonly application: Application,
  ) {
    this.title = `Provide a brief summary of ${personName(application.person)}'s offending history`
  }

  response() {
    return { 'Summary of offending history': this.body.summary }
  }

  previous() {
    return 'dashboard'
  }

  next() {
    return 'sentence-type'
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.summary) {
      errors.summary = `You must enter a summary of ${personName(this.application.person)}'s offending history`
    }

    return errors
  }
}
