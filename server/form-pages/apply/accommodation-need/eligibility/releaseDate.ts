import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { ObjectWithDateParts, TaskListErrors } from '@approved-premises/ui'
import { DateFormats, dateAndTimeInputsAreValidDates, dateIsBlank, dateIsInThePast } from '../../../../utils/dateUtils'
import TasklistPage from '../../../tasklistPage'
import { dateBodyProperties } from '../../../utils'
import { Page } from '../../../utils/decorators'

type ReleaseDateBody = ObjectWithDateParts<'releaseDate'>

@Page({
  name: 'release-date',
  bodyProperties: dateBodyProperties('releaseDate'),
})
export default class ReleaseDate implements TasklistPage {
  title: string

  constructor(
    private _body: Partial<ReleaseDateBody>,
    readonly application: Application,
  ) {
    const { name } = application.person

    this.title = `What is ${name}'s release date?`
  }

  public set body(value: Partial<ReleaseDateBody>) {
    this._body = {
      ...value,
      ...DateFormats.dateAndTimeInputsToIsoString(value, 'releaseDate'),
    }
  }

  public get body(): Partial<ReleaseDateBody> {
    return this._body
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

    if (dateIsBlank(this.body, 'releaseDate')) {
      errors.releaseDate = 'You must specify the release date'
    } else if (!dateAndTimeInputsAreValidDates(this.body, 'releaseDate')) {
      errors.releaseDate = 'You must specify a valid release date'
    } else if (dateIsInThePast(this.body.releaseDate)) {
      errors.releaseDate = 'The release date must not be in the past'
    }

    return errors
  }
}
