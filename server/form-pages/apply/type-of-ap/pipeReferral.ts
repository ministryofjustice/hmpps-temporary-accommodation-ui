import type { YesOrNo, ObjectWithDateParts } from '@approved-premises/ui'
import type { Application } from '@approved-premises/api'

import TasklistPage from '../../tasklistPage'
import { convertToTitleCase } from '../../../utils/utils'
import { dateIsBlank, dateAndTimeInputsAreValidDates, DateFormats } from '../../../utils/dateUtils'

export default class PipeReferral implements TasklistPage {
  name = 'pipe-referral'

  body: ObjectWithDateParts<'opdPathwayDate'> & { opdPathway: YesOrNo }

  title = `Has ${this.application.person.name} been screened into the OPD pathway?`

  constructor(body: Record<string, unknown>, private readonly application: Application) {
    this.body = {
      'opdPathwayDate-year': body['opdPathwayDate-year'] as string,
      'opdPathwayDate-month': body['opdPathwayDate-month'] as string,
      'opdPathwayDate-day': body['opdPathwayDate-day'] as string,
      opdPathwayDate: body.opdPathwayDate as string,
      opdPathway: body.opdPathway as YesOrNo,
    }
  }

  next() {
    return 'pipe-opd-screening'
  }

  previous() {
    return 'ap-type'
  }

  response() {
    const response = {
      [this.title]: convertToTitleCase(this.body.opdPathway),
    } as Record<string, string>

    if (this.body.opdPathway === 'yes') {
      response['OPD Pathway Screening Date'] = DateFormats.isoDateToUIDate(this.body.opdPathwayDate)
    }

    return response
  }

  errors() {
    const errors = []

    if (!this.body.opdPathway) {
      errors.push({
        propertyName: '$.opdPathway',
        errorType: 'empty',
      })
    }

    if (this.body.opdPathway === 'yes') {
      if (dateIsBlank(this.body)) {
        errors.push({
          propertyName: '$.opdPathwayDate',
          errorType: 'empty',
        })
      } else if (!dateAndTimeInputsAreValidDates(this.body, 'opdPathwayDate')) {
        errors.push({
          propertyName: '$.opdPathwayDate',
          errorType: 'invalid',
        })
      }
    }

    return errors
  }
}
