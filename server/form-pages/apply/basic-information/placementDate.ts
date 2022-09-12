import type { ObjectWithDateParts, YesOrNo } from 'approved-premises'

import TasklistPage from '../../tasklistPage'
import { dateAndTimeInputsAreValidDates } from '../../../utils/utils'

export default class PlacementDate implements TasklistPage {
  name = 'placement-date'

  title = 'Is [release-date] the date you want the placement to start?'

  body: ObjectWithDateParts<'startDate'> & {
    startDateSameAsReleaseDate: YesOrNo
  }

  constructor(body: Record<string, unknown>) {
    this.body = {
      'startDate-year': body['startDate-year'] as string,
      'startDate-month': body['startDate-month'] as string,
      'startDate-day': body['startDate-day'] as string,
      startDateSameAsReleaseDate: body.startDateSameAsReleaseDate as YesOrNo,
    }
  }

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
      } else if (!dateAndTimeInputsAreValidDates(this.body, 'startDate')) {
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
