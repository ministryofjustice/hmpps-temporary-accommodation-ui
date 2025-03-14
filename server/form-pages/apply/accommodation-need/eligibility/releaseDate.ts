import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { ObjectWithDateParts, TaskListErrors } from '@approved-premises/ui'
import { DateFormats, dateAndTimeInputsAreValidDates, dateIsBlank, dateIsInThePast } from '../../../../utils/dateUtils'
import TasklistPage from '../../../tasklistPage'
import { dateBodyProperties } from '../../../utils'
import { Page } from '../../../utils/decorators'
import { personName } from '../../../../utils/personUtils'

type ReleaseDateBody = ObjectWithDateParts<'releaseDate'>

@Page({
  name: 'release-date',
  bodyProperties: dateBodyProperties('releaseDate'),
})
export default class ReleaseDate implements TasklistPage {
  title: string

  htmlDocumentTitle = "What is the person's release date?"

  constructor(
    private _body: Partial<ReleaseDateBody>,
    readonly application: Application,
  ) {
    const name = personName(application.person)

    this.title = `${name}'s release date`
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
    const errors: Record<string, string> = {}

    if (dateIsBlank(this.body, 'releaseDate')) {
      errors.releaseDate = 'You must specify the release date'
    } else if (!dateAndTimeInputsAreValidDates(this.body, 'releaseDate')) {
      errors.releaseDate = 'You must specify a valid release date'
    } else if (dateIsInThePast(this.body.releaseDate)) {
      errors.releaseDate = 'The release date must not be in the past'
    }

    return errors as TaskListErrors<this>
  }
}
