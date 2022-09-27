import type { YesOrNo, ObjectWithDateParts } from 'approved-premises'

import TasklistPage from '../../tasklistPage'
import { dateIsBlank, dateAndTimeInputsAreValidDates } from '../../../utils/dateUtils'

export default class PipeReferral implements TasklistPage {
  name = 'pipe-referral'

  body: ObjectWithDateParts<'opdPathwayDate'> & { opdPathway: YesOrNo }

  title = 'Has xxxx been screened into the OPD pathway?'

  constructor(body: Record<string, unknown>) {
    this.body = {
      'opdPathwayDate-year': body['opdPathwayDate-year'] as string,
      'opdPathwayDate-month': body['opdPathwayDate-month'] as string,
      'opdPathwayDate-day': body['opdPathwayDate-day'] as string,
      opdPathway: body.opdPathway as YesOrNo,
    }
  }

  next() {
    return 'pipe-opd-screening'
  }

  previous() {
    return 'ap-type'
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
