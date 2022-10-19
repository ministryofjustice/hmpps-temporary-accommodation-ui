import type { YesOrNo, ObjectWithDateParts, TaskListErrors } from '@approved-premises/ui'
import type { Application } from '@approved-premises/api'

import TasklistPage from '../../tasklistPage'
import { convertToTitleCase } from '../../../utils/utils'
import { dateIsBlank, dateAndTimeInputsAreValidDates, DateFormats } from '../../../utils/dateUtils'

export default class PipeReferral implements TasklistPage {
  name = 'pipe-referral'

  body: ObjectWithDateParts<'opdPathwayDate'> & { opdPathway: YesOrNo }

  title = `Has ${this.application.person.name} been screened into the OPD pathway?`

  questions = {
    opdPathway: this.title,
    opdPathwayDate: `When was ${this.application.person.name}'s last consultation or formulation?`,
  }

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
      [this.questions.opdPathway]: convertToTitleCase(this.body.opdPathway),
    } as Record<string, string>

    if (this.body.opdPathway === 'yes') {
      response[this.questions.opdPathwayDate] = DateFormats.isoDateToUIDate(this.body.opdPathwayDate)
    }

    return response
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.opdPathway) {
      errors.opdPathway = `You must specify if ${this.application.person.name} has been screened into the OPD pathway`
    }

    if (this.body.opdPathway === 'yes') {
      if (dateIsBlank(this.body)) {
        errors.opdPathwayDate = 'You must enter an OPD Pathway date'
      } else if (!dateAndTimeInputsAreValidDates(this.body, 'opdPathwayDate')) {
        errors.opdPathwayDate = 'The OPD Pathway date is an invalid date'
      }
    }

    return errors
  }
}
