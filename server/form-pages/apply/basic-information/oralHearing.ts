import type { TasklistPage, ObjectWithDateParts, YesOrNo } from 'approved-premises'
import { dateAndTimeInputsAreValidDates } from '../../../utils/utils'

export default class OralHearing implements TasklistPage {
  name = 'oral-hearing'

  title = 'Do you know Robert Brown’s oral hearing date?'

  body: ObjectWithDateParts<'oralHearingDate'> & {
    knowOralHearingDate: YesOrNo
  }

  constructor(body: Record<string, unknown>) {
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
        propertyName: 'knowOralHearingDate',
        errorType: 'blank',
      })
    }

    if (this.body.knowOralHearingDate === 'yes') {
      if (this.oralHearingDateIsBlank()) {
        errors.push({
          propertyName: 'oralHearingDate',
          errorType: 'blank',
        })
      } else if (!dateAndTimeInputsAreValidDates(this.body, 'oralHearingDate')) {
        errors.push({
          propertyName: 'oralHearingDate',
          errorType: 'invalid',
        })
      }
    }

    return errors
  }

  private oralHearingDateIsBlank(): boolean {
    return (
      !this.body['oralHearingDate-year'] && !this.body['oralHearingDate-month'] && !this.body['oralHearingDate-day']
    )
  }
}
