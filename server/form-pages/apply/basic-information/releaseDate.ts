import type { ObjectWithDateParts, YesOrNo, TaskListErrors } from '@approved-premises/ui'
import type { ApprovedPremisesApplication as Application } from '@approved-premises/api'

import TasklistPage from '../../tasklistPage'
import { dateAndTimeInputsAreValidDates, dateIsBlank, DateFormats } from '../../../utils/dateUtils'
import { convertToTitleCase } from '../../../utils/utils'

export default class ReleaseDate implements TasklistPage {
  name = 'release-date'

  title = `Do you know ${this.application.person.name}’s release date?`

  body: ObjectWithDateParts<'releaseDate'> & {
    knowReleaseDate: YesOrNo
  }

  previousPage: string

  constructor(body: Record<string, unknown>, private readonly application: Application, previousPage: string) {
    this.body = {
      'releaseDate-year': body['releaseDate-year'] as string,
      'releaseDate-month': body['releaseDate-month'] as string,
      'releaseDate-day': body['releaseDate-day'] as string,
      releaseDate: body.releaseDate as string,
      knowReleaseDate: body.knowReleaseDate as YesOrNo,
    }

    this.previousPage = previousPage
  }

  next() {
    return this.body.knowReleaseDate === 'yes' ? 'placement-date' : 'oral-hearing'
  }

  previous() {
    return this.previousPage
  }

  response() {
    const response = {
      [this.title]: convertToTitleCase(this.body.knowReleaseDate),
    } as Record<string, string>

    if (this.body.knowReleaseDate === 'yes') {
      response['Release Date'] = DateFormats.isoDateToUIDate(this.body.releaseDate)
    }

    return response
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.knowReleaseDate) {
      errors.knowReleaseDate = 'You must specify if you know the release date'
    }

    if (this.body.knowReleaseDate === 'yes') {
      if (dateIsBlank(this.body)) {
        errors.releaseDate = 'You must specify the release date'
      } else if (!dateAndTimeInputsAreValidDates(this.body, 'releaseDate')) {
        errors.releaseDate = 'The release date is an invalid date'
      }
    }

    return errors
  }
}
