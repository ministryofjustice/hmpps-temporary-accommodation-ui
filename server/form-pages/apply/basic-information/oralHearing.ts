import type { ObjectWithDateParts, YesOrNo, Application } from 'approved-premises'

import TasklistPage from '../../tasklistPage'
import { dateAndTimeInputsAreValidDates, dateIsBlank } from '../../../utils/dateUtils'

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
      knowOralHearingDate: body.knowOralHearingDate as YesOrNo,
    }
  }

  next() {
    return 'placement-date'
  }

  previous() {
    return 'release-date'
  }

  errors() {
    const errors = []

    if (!this.body.knowOralHearingDate) {
      errors.push({
        propertyName: '$.knowOralHearingDate',
        errorType: 'empty',
      })
    }

    if (this.body.knowOralHearingDate === 'yes') {
      if (dateIsBlank(this.body)) {
        errors.push({
          propertyName: '$.oralHearingDate',
          errorType: 'empty',
        })
      } else if (!dateAndTimeInputsAreValidDates(this.body, 'oralHearingDate')) {
        errors.push({
          propertyName: '$.oralHearingDate',
          errorType: 'invalid',
        })
      }
    }

    return errors
  }
}
