import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { ObjectWithDateParts, TaskListErrors } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import { DateFormats, dateAndTimeInputsAreValidDates, dateIsBlank } from '../../../../utils/dateUtils'
import TasklistPage from '../../../tasklistPage'
import { dateBodyProperties } from '../../../utils'

type ReleaseTypeBody = {
  releaseTypes: Array<'licence' | 'pss'>
} & ObjectWithDateParts<'licenceStartDate'> &
  ObjectWithDateParts<'licenceEndDate'> &
  ObjectWithDateParts<'pssStartDate'> &
  ObjectWithDateParts<'pssEndDate'>

@Page({
  name: 'release-type',
  bodyProperties: [
    'releaseTypes',
    ...dateBodyProperties('licenceStartDate'),
    ...dateBodyProperties('licenceEndDate'),
    ...dateBodyProperties('pssStartDate'),
    ...dateBodyProperties('pssEndDate'),
  ],
})
export default class ReleaseType implements TasklistPage {
  title = 'What is the release type?'

  constructor(
    private _body: Partial<ReleaseTypeBody>,
    readonly application: Application,
  ) {}

  public set body(value: Partial<ReleaseTypeBody>) {
    this._body = {
      ...value,
      ...DateFormats.dateAndTimeInputsToIsoString(value, 'licenceStartDate'),
      ...DateFormats.dateAndTimeInputsToIsoString(value, 'licenceEndDate'),
      ...DateFormats.dateAndTimeInputsToIsoString(value, 'pssStartDate'),
      ...DateFormats.dateAndTimeInputsToIsoString(value, 'pssEndDate'),
    }
  }

  public get body(): Partial<ReleaseTypeBody> {
    return this._body
  }

  response() {
    const response = {
      [this.title]: this.body.releaseTypes
        .map(releaseType => (releaseType === 'licence' ? 'Licence' : 'Post sentence supervision (PSS)'))
        .join('\n'),
    }

    if (this.body.releaseTypes.includes('licence')) {
      response['Licence start date'] = DateFormats.isoDateToUIDate(this.body.licenceStartDate)
      response['Licence end date'] = DateFormats.isoDateToUIDate(this.body.licenceEndDate)
    }

    if (this.body.releaseTypes.includes('pss')) {
      response['PSS start date'] = DateFormats.isoDateToUIDate(this.body.pssStartDate)
      response['PSS end date'] = DateFormats.isoDateToUIDate(this.body.pssEndDate)
    }

    return response
  }

  previous() {
    return 'sentence-expiry'
  }

  next() {
    return ''
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.releaseTypes?.length) {
      errors.releaseTypes = 'You must specify the release types'
    }

    if (this.body.releaseTypes?.includes('licence')) {
      if (dateIsBlank(this.body, 'licenceStartDate')) {
        errors.licenceStartDate = 'You must specify the licence start date'
      } else if (!dateAndTimeInputsAreValidDates(this.body, 'licenceStartDate')) {
        errors.licenceStartDate = 'You must specify a valid licence start date'
      }

      if (dateIsBlank(this.body, 'licenceEndDate')) {
        errors.licenceEndDate = 'You must specify the licence end date'
      } else if (!dateAndTimeInputsAreValidDates(this.body, 'licenceEndDate')) {
        errors.licenceEndDate = 'You must specify a valid licence end date'
      }
    }

    if (this.body.releaseTypes?.includes('pss')) {
      if (dateIsBlank(this.body, 'pssStartDate')) {
        errors.pssStartDate = 'You must specify the PSS start date'
      } else if (!dateAndTimeInputsAreValidDates(this.body, 'pssStartDate')) {
        errors.pssStartDate = 'You must specify a valid PSS start date'
      }

      if (dateIsBlank(this.body, 'pssEndDate')) {
        errors.pssEndDate = 'You must specify the PSS end date'
      } else if (!dateAndTimeInputsAreValidDates(this.body, 'pssEndDate')) {
        errors.pssEndDate = 'You must specify a valid PSS end date'
      }
    }

    return errors
  }
}
