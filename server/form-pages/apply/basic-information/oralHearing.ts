import type { TasklistPage, ObjectWithDateParts } from 'approved-premises'
import { dateAndTimeInputsAreValidDates } from '../../../utils/utils'

export default class OralHearing implements TasklistPage {
  name = 'oral-hearing'

  title = 'Do you know Robert Brown’s oral hearing date?'

  constructor(readonly body: Record<string, unknown>) {}

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
      } else if (
        !dateAndTimeInputsAreValidDates(this.body as ObjectWithDateParts<'oralHearingDate'>, 'oralHearingDate')
      ) {
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
