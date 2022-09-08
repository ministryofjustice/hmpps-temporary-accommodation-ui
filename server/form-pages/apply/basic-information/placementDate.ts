import type { TasklistPage, ObjectWithDateParts } from 'approved-premises'
import { dateAndTimeInputsAreValidDates } from '../../../utils/utils'

export default class PlacementDate implements TasklistPage {
  name = 'placement-date'

  title = 'Is [release-date] the date you want the placement to start?'

  constructor(readonly body: Record<string, unknown>) {}

  next() {
    return ''
  }

  previous() {
    return 'oral-hearing'
  }

  errors() {
    const errors = []

    if (!this.body.startDateSameAsReleaseDate) {
      errors.push({
        propertyName: 'startDateSameAsReleaseDate',
        errorType: 'blank',
      })
    }

    if (this.body.startDateSameAsReleaseDate === 'no') {
      if (this.startDateIsBlank()) {
        errors.push({
          propertyName: 'startDate',
          errorType: 'blank',
        })
      } else if (!dateAndTimeInputsAreValidDates(this.body as ObjectWithDateParts<'startDate'>, 'startDate')) {
        errors.push({
          propertyName: 'startDate',
          errorType: 'invalid',
        })
      }
    }

    return errors
  }

  private startDateIsBlank(): boolean {
    return !this.body['startDate-year'] && !this.body['startDate-month'] && !this.body['startDate-day']
  }
}
