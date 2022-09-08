import type { TasklistPage, ObjectWithDateParts } from 'approved-premises'
import { dateAndTimeInputsAreValidDates } from '../../../utils/utils'

export default class ReleaseDate implements TasklistPage {
  name = 'release-date'

  title = 'Do you know Robert Brown’s release date?'

  constructor(readonly body: Record<string, unknown>) {}

  next() {
    return this.body.knowReleaseDate === 'yes' ? 'placement-date' : 'oral-hearing'
  }

  previous() {
    return 'release-type'
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
      if (this.releaseDateIsBlank()) {
        errors.push({
          propertyName: 'releaseDate',
          errorType: 'blank',
        })
      } else if (!dateAndTimeInputsAreValidDates(this.body as ObjectWithDateParts<'releaseDate'>, 'releaseDate')) {
        errors.push({
          propertyName: 'releaseDate',
          errorType: 'invalid',
        })
      }
    }

    return errors
  }

  private releaseDateIsBlank(): boolean {
    return !this.body['releaseDate-year'] && !this.body['releaseDate-month'] && !this.body['releaseDate-day']
  }
}
