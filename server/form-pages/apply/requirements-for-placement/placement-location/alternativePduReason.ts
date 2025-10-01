import { PageResponse, TaskListErrors } from '@approved-premises/ui'
import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import { Page } from '../../../utils/decorators'
import TasklistPage from '../../../tasklistPage'

export type AlternativePduReasonBody = {
  reason: string
}

@Page({ name: 'alternative-pdu-reason', bodyProperties: ['reason'] })
export default class AlternativePduReason implements TasklistPage {
  title = 'Provide a reason for choosing a different PDU (Probation Delivery Unit)'

  htmlDocumentTitle = this.title

  constructor(
    readonly body: Partial<AlternativePduReasonBody>,
    readonly application: Application,
  ) {}

  previous(): string {
    return 'alternative-pdu'
  }

  next(): string {
    return ''
  }

  response(): PageResponse {
    return {
      'Reason for choosing an alternative PDU': this.body.reason,
    }
  }

  errors(): Partial<Record<keyof this['body'], unknown>> {
    const errors: TaskListErrors<this> = {}

    if (!this.body.reason) {
      errors.reason = 'You must provide a reason for choosing a different PDU'
    }

    return errors
  }
}
