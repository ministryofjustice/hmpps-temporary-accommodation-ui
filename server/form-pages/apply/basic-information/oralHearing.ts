import type { ObjectWithDateParts, YesOrNo, TaskListErrors } from '@approved-premises/ui'
import type { Application } from '@approved-premises/api'

import TasklistPage from '../../tasklistPage'
import { dateAndTimeInputsAreValidDates, dateIsBlank, DateFormats } from '../../../utils/dateUtils'
import { convertToTitleCase } from '../../../utils/utils'

export default class OralHearing implements TasklistPage {
  name = 'oral-hearing'

  title = `Do you know ${this.application.person.name}’s oral hearing date?`

  body: ObjectWithDateParts<'oralHearingDate'> & {
    knowOralHearingDate: YesOrNo
  }

  constructor(body: Record<string, unknown>, private readonly application: Application) {
    this.body = {
      'oralHearingDate-year': body['oralHearingDate-year'] as string,
      'oralHearingDate-month': body['oralHearingDate-month'] as string,
      'oralHearingDate-day': body['oralHearingDate-day'] as string,
      oralHearingDate: body.oralHearingDate as string,
      knowOralHearingDate: body.knowOralHearingDate as YesOrNo,
    }
  }

  next() {
    return 'placement-date'
  }

  previous() {
    return 'release-date'
  }

  response() {
    const response = {
      [this.title]: convertToTitleCase(this.body.knowOralHearingDate),
    } as Record<string, string>

    if (this.body.knowOralHearingDate === 'yes') {
      response['Oral Hearing Date'] = DateFormats.isoDateToUIDate(this.body.oralHearingDate)
    }

    return response
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.knowOralHearingDate) {
      errors.knowOralHearingDate = 'You must specify if you know the oral hearing date'
    }

    if (this.body.knowOralHearingDate === 'yes') {
      if (dateIsBlank(this.body)) {
        errors.oralHearingDate = 'You must specify the oral hearing date'
      } else if (!dateAndTimeInputsAreValidDates(this.body, 'oralHearingDate')) {
        errors.oralHearingDate = 'The oral hearing date is an invalid date'
      }
    }

    return errors
  }
}
