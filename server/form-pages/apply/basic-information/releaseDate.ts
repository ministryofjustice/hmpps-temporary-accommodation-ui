import type { ObjectWithDateParts, YesOrNo } from 'approved-premises'

import TasklistPage from '../../tasklistPage'
import { dateAndTimeInputsAreValidDates, dateIsBlank } from '../../../utils/utils'

export default class ReleaseDate implements TasklistPage {
  name = 'release-date'

  title = 'Do you know Robert Brown’s release date?'

  body: ObjectWithDateParts<'releaseDate'> & {
    knowReleaseDate: YesOrNo
  }

  previousPage: string

  constructor(body: Record<string, unknown>, _session: Record<string, unknown>, previousPage: string) {
    this.body = {
      'releaseDate-year': body['releaseDate-year'] as string,
      'releaseDate-month': body['releaseDate-month'] as string,
      'releaseDate-day': body['releaseDate-day'] as string,
      knowReleaseDate: body.knowReleaseDate as YesOrNo,
    }

    this.previousPage = previousPage
  }

  next() {
    return this.body.knowReleaseDate === 'yes' ? 'placement-date' : 'oral-hearing'
  }

  previous() {
    return this.previousPage
  }

  errors() {
    const errors = []

    if (!this.body.knowReleaseDate) {
      errors.push({
        propertyName: 'knowReleaseDate',
        errorType: 'blank',
      })
    }

    if (this.body.knowReleaseDate === 'yes') {
      if (dateIsBlank(this.body)) {
        errors.push({
          propertyName: 'releaseDate',
          errorType: 'blank',
        })
      } else if (!dateAndTimeInputsAreValidDates(this.body, 'releaseDate')) {
        errors.push({
          propertyName: 'releaseDate',
          errorType: 'invalid',
        })
      }
    }

    return errors
  }
}
