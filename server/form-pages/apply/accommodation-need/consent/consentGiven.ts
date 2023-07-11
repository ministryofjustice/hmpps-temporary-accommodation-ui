import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { TaskListErrors, YesOrNo } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import { sentenceCase } from '../../../../utils/utils'
import TasklistPage from '../../../tasklistPage'

type ConsentGivenBody = {
  consentGiven: YesOrNo
}

@Page({ name: 'consent-given', bodyProperties: ['consentGiven'] })
export default class ConsentGiven implements TasklistPage {
  title = 'Has consent for Temporary Accommodation been given?'

  constructor(readonly body: Partial<ConsentGivenBody>, readonly application: Application) {}

  response() {
    return { [this.title]: sentenceCase(this.body.consentGiven) }
  }

  previous() {
    return 'dashboard'
  }

  next() {
    return ''
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.consentGiven) {
      errors.consentGiven = 'You must specify if consent for Temporary Accommodation has been given'
    }

    return errors
  }
}
