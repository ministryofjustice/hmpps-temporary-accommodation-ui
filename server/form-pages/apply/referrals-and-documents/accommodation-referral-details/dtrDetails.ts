import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { ObjectWithDateParts, TaskListErrors } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import { DateFormats, dateAndTimeInputsAreValidDates, dateIsBlank, dateIsInFuture } from '../../../../utils/dateUtils'
import TasklistPage from '../../../tasklistPage'

type DtrDetailsBody = {
  reference: string
} & ObjectWithDateParts<'date'>

@Page({ name: 'dtr-details', bodyProperties: ['reference', 'date', 'date-year', 'date-month', 'date-day'] })
export default class DtrDetails implements TasklistPage {
  title = 'Provide further details'

  questions = {
    reference: 'DTR / NOP reference number',
    date: 'Date DTR / NOP was submitted',
  }

  constructor(readonly body: Partial<DtrDetailsBody>, readonly application: Application) {}

  response() {
    return {
      [this.questions.reference]: this.body.reference,
      [this.questions.date]: DateFormats.isoDateToUIDate(this.body.date),
    }
  }

  previous() {
    return 'dtr-submitted'
  }

  next() {
    return 'crs-submitted'
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.reference) {
      errors.reference = 'You must specify the DTR / NOP reference number'
    }

    if (dateIsBlank(this.body)) {
      errors.date = 'You must specify the date DTR / NOP was submitted'
    } else if (!dateAndTimeInputsAreValidDates(this.body as ObjectWithDateParts<'date'>, 'date')) {
      errors.date = 'You must specify a valid date DTR / NOP was submitted'
    } else if (dateIsInFuture(this.body.date)) {
      errors.date = 'The date DTR / NOP was submitted must not be in the future'
    }

    return errors
  }
}
