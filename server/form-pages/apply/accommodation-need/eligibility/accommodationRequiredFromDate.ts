import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { ObjectWithDateParts, TaskListErrors } from '@approved-premises/ui'
import { DateFormats, dateAndTimeInputsAreValidDates, dateIsBlank, dateIsInThePast } from '../../../../utils/dateUtils'
import TasklistPage from '../../../tasklistPage'
import { dateBodyProperties } from '../../../utils'
import { Page } from '../../../utils/decorators'

type AccommodationRequiredFromDateBody = ObjectWithDateParts<'accommodationRequiredFromDate'>

@Page({
  name: 'accommodation-required-from-date',
  bodyProperties: dateBodyProperties('accommodationRequiredFromDate'),
})
export default class AccommodationRequiredFromDate implements TasklistPage {
  title = 'What date is accommodation required from?'

  htmlDocumentTitle = this.title

  constructor(
    private _body: Partial<AccommodationRequiredFromDateBody>,
    readonly application: Application,
  ) {}

  public set body(value: Partial<AccommodationRequiredFromDateBody>) {
    this._body = {
      ...value,
      ...DateFormats.dateAndTimeInputsToIsoString(value, 'accommodationRequiredFromDate'),
    }
  }

  public get body(): Partial<AccommodationRequiredFromDateBody> {
    return this._body
  }

  response() {
    return {
      'Accommodation required from date': DateFormats.isoDateToUIDate(this.body.accommodationRequiredFromDate),
    }
  }

  previous() {
    return 'release-date'
  }

  next() {
    return ''
  }

  errors() {
    const errors: Record<string, string> = {}

    if (dateIsBlank(this.body, 'accommodationRequiredFromDate')) {
      errors.accommodationRequiredFromDate = 'You must specify the date accommodation is required from'
    } else if (!dateAndTimeInputsAreValidDates(this.body, 'accommodationRequiredFromDate')) {
      errors.accommodationRequiredFromDate = 'You must specify a valid date accommodation is required from'
    } else if (dateIsInThePast(this.body.accommodationRequiredFromDate)) {
      errors.accommodationRequiredFromDate = 'The date accommodation is required from must not be in the past'
    }

    return errors as TaskListErrors<this>
  }
}
