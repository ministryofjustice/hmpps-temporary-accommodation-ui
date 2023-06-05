import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { ObjectWithDateParts, TaskListErrors } from '@approved-premises/ui'
import { DateFormats, dateAndTimeInputsAreValidDates, dateIsBlank, dateIsInThePast } from '../../../../utils/dateUtils'
import TasklistPage from '../../../tasklistPage'
import { Page } from '../../../utils/decorators'

type ReleaseDateBody = ObjectWithDateParts<'releaseDate'>

@Page({
  name: 'release-date',
  bodyProperties: ['releaseDate', 'releaseDate-year', 'releaseDate-month', 'releaseDate-day'],
})
export default class ReleaseDate implements TasklistPage {
  title: string

  constructor(readonly body: Partial<ReleaseDateBody>, readonly application: Application) {
    const { name } = application.person

    this.title = `What is ${name}'s release date?`
  }

  response() {
    return {
      'Release date': DateFormats.isoDateToUIDate(this.body.releaseDate),
    }
  }

  previous() {
    return 'eligibility-reason'
  }

  next() {
    return 'accommodation-required-from-date'
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (dateIsBlank(this.body)) {
      errors.releaseDate = 'You must specify the release date'
    } else if (!dateAndTimeInputsAreValidDates(this.body as ObjectWithDateParts<'releaseDate'>, 'releaseDate')) {
      errors.releaseDate = 'You must specify a valid release date'
    } else if (dateIsInThePast(this.body.releaseDate)) {
      errors.releaseDate = 'The release date must not be in the past'
    }

    return errors
  }
}
