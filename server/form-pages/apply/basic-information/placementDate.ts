import type { ObjectWithDateParts, YesOrNo, TaskListErrors } from '@approved-premises/ui'
import type { ApprovedPremisesApplication as Application } from '@approved-premises/api'

import TasklistPage from '../../tasklistPage'
import { retrieveQuestionResponseFromApplication, convertToTitleCase } from '../../../utils/utils'
import { dateIsBlank, dateAndTimeInputsAreValidDates, DateFormats } from '../../../utils/dateUtils'

export default class PlacementDate implements TasklistPage {
  name = 'placement-date'

  title: string

  body: ObjectWithDateParts<'startDate'> & {
    startDateSameAsReleaseDate: YesOrNo
  }

  constructor(body: Record<string, unknown>, application: Application) {
    this.body = {
      'startDate-year': body['startDate-year'] as string,
      'startDate-month': body['startDate-month'] as string,
      'startDate-day': body['startDate-day'] as string,
      startDate: body.startDate as string,
      startDateSameAsReleaseDate: body.startDateSameAsReleaseDate as YesOrNo,
    }

    const formattedReleaseDate = DateFormats.isoDateToUIDate(
      retrieveQuestionResponseFromApplication(application, 'basic-information', 'releaseDate'),
    )

    this.title = `Is ${formattedReleaseDate} the date you want the placement to start?`
  }

  next() {
    return 'placement-purpose'
  }

  previous() {
    return 'oral-hearing'
  }

  response() {
    const response = {
      [this.title]: convertToTitleCase(this.body.startDateSameAsReleaseDate),
    } as Record<string, string>

    if (this.body.startDateSameAsReleaseDate === 'no') {
      response['Placement Start Date'] = DateFormats.isoDateToUIDate(this.body.startDate)
    }

    return response
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.startDateSameAsReleaseDate) {
      errors.startDateSameAsReleaseDate = 'You must specify if the start date is the same as the release date'
    }

    if (this.body.startDateSameAsReleaseDate === 'no') {
      if (dateIsBlank(this.body)) {
        errors.startDate = 'You must enter a start date'
      } else if (!dateAndTimeInputsAreValidDates(this.body, 'startDate')) {
        errors.startDate = 'The start date is an invalid date'
      }
    }

    return errors
  }
}
