import type { ObjectWithDateParts, YesOrNo } from 'approved-premises'

import TasklistPage from '../../tasklistPage'
import { retrieveQuestionResponseFromSession } from '../../../utils/utils'
import { dateIsBlank, dateAndTimeInputsAreValidDates, DateFormats } from '../../../utils/dateUtils'

export default class PlacementDate implements TasklistPage {
  name = 'placement-date'

  title: string

  body: ObjectWithDateParts<'startDate'> & {
    startDateSameAsReleaseDate: YesOrNo
  }

  constructor(body: Record<string, unknown>, session: Record<string, unknown>) {
    this.body = {
      'startDate-year': body['startDate-year'] as string,
      'startDate-month': body['startDate-month'] as string,
      'startDate-day': body['startDate-day'] as string,
      startDateSameAsReleaseDate: body.startDateSameAsReleaseDate as YesOrNo,
    }

    const formattedReleaseDate = DateFormats.isoDateToUIDate(
      retrieveQuestionResponseFromSession(session, 'releaseDate'),
    )

    this.title = `Is ${formattedReleaseDate} the date you want the placement to start?`
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
        propertyName: '$.startDateSameAsReleaseDate',
        errorType: 'empty',
      })
    }

    if (this.body.startDateSameAsReleaseDate === 'no') {
      if (dateIsBlank(this.body)) {
        errors.push({
          propertyName: '$.startDate',
          errorType: 'empty',
        })
      } else if (!dateAndTimeInputsAreValidDates(this.body, 'startDate')) {
        errors.push({
          propertyName: '$.startDate',
          errorType: 'invalid',
        })
      }
    }

    return errors
  }
}
